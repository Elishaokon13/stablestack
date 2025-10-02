import connectDB from './database';
import PaymentLink, { IPaymentLink, PaymentLinkData } from './models/PaymentLink';

// Database-backed store for payment links
export async function storePaymentLink(link: PaymentLinkData) {
  await connectDB();
  
  const paymentLink = new PaymentLink(link);
  return await paymentLink.save();
}

export async function getPaymentLink(slug: string): Promise<IPaymentLink | null> {
  await connectDB();
  return await PaymentLink.findBySlug(slug);
}

export async function getAllPaymentLinks(): Promise<IPaymentLink[]> {
  await connectDB();
  return await PaymentLink.find({}).sort({ createdAt: -1 });
}

export async function getPaymentLinksBySeller(sellerId: string): Promise<IPaymentLink[]> {
  await connectDB();
  return await PaymentLink.findBySeller(sellerId);
}

export async function updatePaymentLinkStatus(slug: string, status: 'active' | 'inactive'): Promise<IPaymentLink | null> {
  await connectDB();
  return await PaymentLink.updateStatus(slug, status);
}
