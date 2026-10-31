export interface VariantGroup {
  id: string;
  name: string;
  options: string[];
}

export interface ProductVariant {
  id: string;
  combination: Record<string, string>;
  price: number;
  stock: number;
  weight: number | null;
  imageUrl: string | null;
}
