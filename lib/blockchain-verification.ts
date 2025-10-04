// Blockchain verification functionality has been disabled
// This file is kept for future reference but all functions are disabled

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
  throw new BlockchainVerificationError(
    'Blockchain verification is currently disabled',
    'FEATURE_DISABLED'
  );
}

export async function checkWalletBalance(
  address: string
): Promise<{
  usdc: string;
  eth: string;
}> {
  throw new BlockchainVerificationError(
    'Wallet balance checking is currently disabled',
    'FEATURE_DISABLED'
  );
}
