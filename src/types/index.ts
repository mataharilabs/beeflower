export type { CraftComponent, CraftNode, CraftJson } from "./craft";

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string | number;
    images: string[];
    slug: string;
    stock: number;
  };
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: "XENDIT" | "MANUAL_TRANSFER";
  bankAccountId?: string;
  notes?: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  newMessages: number;
  pendingProofs: number;
}
