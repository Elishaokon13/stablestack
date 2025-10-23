/**
 * Product Hooks
 * Export all product-related hooks
 */

export { useProducts } from "./use-products";
export { useCreateProduct } from "./use-create-product";
export { useUpdateProduct } from "./use-update-product";
export { useProductStats } from "./use-product-stats";
export { useProductAnalytics } from "./use-product-analytics";
export { usePublicProduct } from "./use-public-product";
export { usePublicProducts } from "./use-public-products";
export { usePublicProductLink } from "./use-public-product-link";
export { usePaymentLinkStats } from "./use-payment-link-stats";

// Export types
export type { Product } from "./use-products";
export type { ProductStats } from "./use-product-stats";
export type { PublicProduct } from "./use-public-product";
export type { PublicProductItem } from "./use-public-products";
export type { PublicProductLink } from "./use-public-product-link";
export type { PaymentLinkStats } from "./use-payment-link-stats";
