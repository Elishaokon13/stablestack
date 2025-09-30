import { ethers } from 'ethers';

// Base network configuration
const BASE_RPC_URL = process.env.ALCHEMY_API_KEY 
  ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  : 'https://mainnet.base.org';

const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base

// USDC ABI for transfer events
const USDC_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export class BlockchainVerificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BlockchainVerificationError';
  }
}

export async function verifyUSDCTransaction(
  transactionHash: string,
  expectedRecipient: string,
  expectedAmount: string
): Promise<{
  isValid: boolean;
  actualAmount: string;
  actualRecipient: string;
  confirmations: number;
}> {
  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    
    // Get transaction details
    const tx = await provider.getTransaction(transactionHash);
    
    if (!tx) {
      throw new BlockchainVerificationError(
        'Transaction not found',
        'TX_NOT_FOUND'
      );
    }
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new BlockchainVerificationError(
        'Transaction not mined',
        'TX_NOT_MINED'
      );
    }
    
    // Check if transaction was successful
    if (receipt.status !== 1) {
      throw new BlockchainVerificationError(
        'Transaction failed',
        'TX_FAILED'
      );
    }
    
    // Create USDC contract instance
    const usdcContract = new ethers.Contract(
      USDC_CONTRACT_ADDRESS,
      USDC_ABI,
      provider
    );
    
    // Parse transfer events
    const transferEvents = receipt.logs
      .map(log => {
        try {
          return usdcContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .filter(parsedLog => parsedLog?.name === 'Transfer');
    
    if (transferEvents.length === 0) {
      throw new BlockchainVerificationError(
        'No USDC transfer events found',
        'NO_TRANSFER_EVENTS'
      );
    }
    
    // Find the transfer to our expected recipient
    const relevantTransfer = transferEvents.find(event => 
      event?.args?.to?.toLowerCase() === expectedRecipient.toLowerCase()
    );
    
    if (!relevantTransfer) {
      throw new BlockchainVerificationError(
        'No transfer to expected recipient found',
        'WRONG_RECIPIENT'
      );
    }
    
    const actualAmount = relevantTransfer.args.value.toString();
    const actualRecipient = relevantTransfer.args.to;
    
    // Check if amount matches (with some tolerance for rounding)
    const expectedAmountBigInt = BigInt(expectedAmount);
    const actualAmountBigInt = BigInt(actualAmount);
    
    // Allow 1% tolerance for rounding differences
    const tolerance = expectedAmountBigInt / 100n;
    const isAmountValid = actualAmountBigInt >= (expectedAmountBigInt - tolerance) &&
                         actualAmountBigInt <= (expectedAmountBigInt + tolerance);
    
    if (!isAmountValid) {
      throw new BlockchainVerificationError(
        `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`,
        'AMOUNT_MISMATCH',
        { expectedAmount, actualAmount }
      );
    }
    
    // Get current block number for confirmation count
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;
    
    return {
      isValid: true,
      actualAmount,
      actualRecipient,
      confirmations,
    };
    
  } catch (error) {
    if (error instanceof BlockchainVerificationError) {
      throw error;
    }
    
    console.error('Blockchain verification error:', error);
    throw new BlockchainVerificationError(
      'Failed to verify transaction',
      'VERIFICATION_FAILED',
      error
    );
  }
}

export async function checkWalletBalance(
  address: string
): Promise<{
  usdc: string;
  eth: string;
}> {
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    
    // Get ETH balance
    const ethBalance = await provider.getBalance(address);
    const ethFormatted = ethers.formatEther(ethBalance);
    
    // Get USDC balance
    const usdcContract = new ethers.Contract(
      USDC_CONTRACT_ADDRESS,
      USDC_ABI,
      provider
    );
    
    const usdcBalance = await usdcContract.balanceOf(address);
    const usdcFormatted = ethers.formatUnits(usdcBalance, 6); // USDC has 6 decimals
    
    return {
      usdc: usdcFormatted,
      eth: ethFormatted,
    };
    
  } catch (error) {
    console.error('Error checking wallet balance:', error);
    throw new BlockchainVerificationError(
      'Failed to check wallet balance',
      'BALANCE_CHECK_FAILED',
      error
    );
  }
}
