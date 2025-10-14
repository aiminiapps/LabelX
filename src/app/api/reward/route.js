import { NextResponse } from 'next/server';

// ✅ FIXED DIRECT TRANSACTION API
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;
const BSC_RPC_URL = 'https://bsc-rpc.publicnode.com';

console.log('🔧 Fixed Transaction API Configuration:');
console.log('- Admin Key:', ADMIN_PRIVATE_KEY ? '✅ Present' : '❌ Missing');
console.log('- Token Address:', TOKEN_CONTRACT_ADDRESS ? '✅ Present' : '❌ Missing');

const TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';

// Nonce tracking
const processedNonces = new Set();
setInterval(() => processedNonces.clear(), 600000);

// ✅ Direct RPC call
async function directRPCCall(method, params = []) {
  const response = await fetch(BSC_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(`RPC error: ${data.error.message}`);
  return data.result;
}

// ✅ FIXED: Proper hex encoding for ERC-20 transfer
function createTransferData(recipientAddress, tokenAmount) {
  // Dynamic import ethers for utilities
  const { ethers } = require('ethers');
  
  // Remove 0x prefix from address and pad to 32 bytes
  const cleanAddress = recipientAddress.replace('0x', '').toLowerCase();
  const paddedAddress = cleanAddress.padStart(64, '0');
  
  // Convert BigNumber amount to hex and pad to 32 bytes
  const amountHex = tokenAmount.toHexString().replace('0x', '');
  const paddedAmount = amountHex.padStart(64, '0');
  
  const data = TRANSFER_FUNCTION_SIGNATURE + paddedAddress + paddedAmount;
  
  console.log('🔍 Transfer Data Construction:');
  console.log('- Function Sig:', TRANSFER_FUNCTION_SIGNATURE);
  console.log('- Address:', recipientAddress, '→', paddedAddress);
  console.log('- Amount:', tokenAmount.toString(), '→', paddedAmount);
  console.log('- Final Data:', data);
  
  return data;
}

export async function POST(request) {
  const startTime = Date.now();
  console.log('\n🥷 FIXED FINJA Transaction API called at:', new Date().toISOString());

  try {
    // Environment validation
    if (!ADMIN_PRIVATE_KEY || !TOKEN_CONTRACT_ADDRESS) {
      return NextResponse.json({ 
        error: 'Missing environment variables' 
      }, { status: 500 });
    }

    // Parse request
    const body = await request.json();
    const { taskId, address, message, signature, nonce, expiry, reward } = body;

    console.log('📦 Processing task:', taskId);
    console.log('👤 From Admin:', process.env.ADMIN_ADDRESS || 'Not set');
    console.log('👤 To User:', address);
    console.log('💰 Amount:', reward, 'FINJ');

    // ✅ Validate that recipient is NOT the same as admin (prevent self-transfer)
    const { ethers } = await import('ethers');
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY);
    
    if (address.toLowerCase() === adminWallet.address.toLowerCase()) {
      console.error('❌ Self-transfer detected!');
      return NextResponse.json({ 
        error: 'Invalid recipient: cannot send to admin wallet' 
      }, { status: 400 });
    }

    // Basic validation
    if (!taskId || !address || !message || !signature || !reward) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!ethers.utils.isAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Signature verified for different address than admin');
    } catch (sigError) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    // Expiry and nonce checks
    const now = Math.floor(Date.now() / 1000);
    if (now > parseInt(expiry)) {
      return NextResponse.json({ error: 'Expired' }, { status: 400 });
    }

    const nonceKey = `${address}_${nonce}`;
    if (processedNonces.has(nonceKey)) {
      return NextResponse.json({ error: 'Already processed' }, { status: 409 });
    }
    processedNonces.add(nonceKey);

    // Task validation
    const validTasks = { followX: 100, commentX: 75, retweetX: 60, joinTelegram: 80 };
    if (!validTasks[taskId] || reward !== validTasks[taskId]) {
      return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
    }

    console.log('✅ All validations passed');

    // Test RPC
    const blockNumber = await directRPCCall('eth_blockNumber');
    console.log('✅ RPC working, block:', parseInt(blockNumber, 16));

    // Get admin nonce and gas price
    const [adminNonce, gasPrice] = await Promise.all([
      directRPCCall('eth_getTransactionCount', [adminWallet.address, 'pending']),
      directRPCCall('eth_gasPrice')
    ]);

    const bufferedGasPrice = Math.floor(parseInt(gasPrice, 16) * 1.2);
    
    // ✅ FIXED: Proper token amount calculation
    const decimals = 18; // FINJ token decimals
    const tokenAmount = ethers.utils.parseUnits(reward.toString(), decimals);
    console.log('💰 Exact token amount:', tokenAmount.toString());


    // Build transaction
    const rawTransaction = {
      nonce: adminNonce,
      gasPrice: '0x' + bufferedGasPrice.toString(16),
      gasLimit: '0x186A0', // 100,000
      to: TOKEN_CONTRACT_ADDRESS,
      value: '0x0',
      data: transactionData,
      chainId: 56
    };

    console.log('🔨 Transaction built for different recipient');

    // Sign and broadcast
    const signedTx = await adminWallet.signTransaction(rawTransaction);
    const txHash = await directRPCCall('eth_sendRawTransaction', [signedTx]);
    
    console.log('📤 Transaction sent:', txHash);

    // Wait for confirmation
    let receipt = null;
    let attempts = 0;
    
    while (!receipt && attempts < 30) {
      try {
        receipt = await directRPCCall('eth_getTransactionReceipt', [txHash]);
        if (receipt) break;
      } catch (error) {
        // Not ready yet
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!receipt) {
      return NextResponse.json({
        success: true,
        txHash,
        amount: reward,
        recipient: address,
        status: 'pending',
        explorer: `https://bscscan.com/tx/${txHash}`,
        message: 'Transaction sent, confirmation pending'
      });
    }

    const status = parseInt(receipt.status, 16);
    if (status !== 1) {
      return NextResponse.json({ 
        error: 'Transaction failed',
        txHash,
        explorer: `https://bscscan.com/tx/${txHash}`
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;

    console.log('🎉 FIXED TRANSACTION SUCCESSFUL!');
    console.log('✅ Sent', reward, 'FINJ from', adminWallet.address, 'to', address);
    console.log('✅ TX Hash:', txHash);

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber: parseInt(receipt.blockNumber, 16),
      gasUsed: parseInt(receipt.gasUsed, 16),
      amount: reward,
      symbol: 'FINJ',
      recipient: address,
      sender: adminWallet.address,
      processingTime,
      explorer: `https://bscscan.com/tx/${txHash}`,
      timestamp: new Date().toISOString(),
      mode: 'REAL_FIXED_TRANSACTION'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Transaction failed: ' + error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { ethers } = await import('ethers');
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY);
    const blockNumber = await directRPCCall('eth_blockNumber');

    return NextResponse.json({
      status: 'healthy',
      mode: 'FIXED_REAL_TRANSACTIONS',
      blockNumber: parseInt(blockNumber, 16),
      adminWallet: adminWallet.address,
      tokenContract: TOKEN_CONTRACT_ADDRESS,
      rpcUrl: BSC_RPC_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 });
  }
}
