import connectDB from '@/lib/database';
import { PaymentLink } from '@/lib/models/PaymentLink';

export interface PaymentLinkData {
  id: string;
  slug: string;
  type: 'product' | 'general';
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  url: string;
  paymentIntentId?: string;
  clientSecret?: string;
  status: 'active' | 'inactive';
  sellerId: string;
}

export async function storePaymentLink(data: PaymentLinkData) {
  try {
    await connectDB();
    
    const paymentLink = await PaymentLink.create({
      id: data.id,
      slug: data.slug,
      type: data.type,
      name: data.name,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      url: data.url,
      paymentIntentId: data.paymentIntentId,
      clientSecret: data.clientSecret,
      status: data.status,
      sellerId: data.sellerId,
    });

    return {
      success: true,
      paymentLink: {
        id: paymentLink._id,
        slug: paymentLink.slug,
        type: paymentLink.type,
        name: paymentLink.name,
        description: paymentLink.description,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        url: paymentLink.url,
        status: paymentLink.status,
        sellerId: paymentLink.sellerId,
        createdAt: paymentLink.createdAt,
        updatedAt: paymentLink.updatedAt,
      }
    };
  } catch (error) {
    console.error('Error storing payment link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getPaymentLinks(options: {
  sellerId: string;
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    await connectDB();
    
    const query: any = { sellerId: options.sellerId };
    
    if (options.status) {
      query.status = options.status;
    }
    
    if (options.type) {
      query.type = options.type;
    }

    const paymentLinks = await PaymentLink.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 20)
      .skip(options.offset || 0);

    const total = await PaymentLink.countDocuments(query);

    return {
      success: true,
      paymentLinks: paymentLinks.map(link => ({
        id: link._id,
        slug: link.slug,
        type: link.type,
        name: link.name,
        description: link.description,
        amount: link.amount,
        currency: link.currency,
        url: link.url,
        status: link.status,
        sellerId: link.sellerId,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      })),
      total,
    };
  } catch (error) {
    console.error('Error fetching payment links:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}