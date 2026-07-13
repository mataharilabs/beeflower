export type BlockType =
  | "Hero"
  | "TextBlock"
  | "ImageText"
  | "CTABanner"
  | "ProductGrid"
  | "FAQSection"
  | "FeatureIcons"
  | "Spacer";

export interface HeroProps {
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonLink: string;
  bgImage: string;
  overlay: boolean;
}

export interface TextBlockProps {
  content: string;
  align: "left" | "center" | "right";
}

export interface ImageTextProps {
  headline: string;
  content: string;
  imageUrl: string;
  imagePosition: "left" | "right";
  buttonText: string;
  buttonLink: string;
}

export interface CTABannerProps {
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
}

export interface ProductGridProps {
  headline: string;
  categorySlug: string;
  count: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  headline: string;
  items: FAQItem[];
}

export interface FeatureIconItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureIconsProps {
  headline: string;
  items: FeatureIconItem[];
}

export interface SpacerProps {
  height: number;
}

export type BlockProps =
  | HeroProps
  | TextBlockProps
  | ImageTextProps
  | CTABannerProps
  | ProductGridProps
  | FAQSectionProps
  | FeatureIconsProps
  | SpacerProps;

export interface Block {
  id: string;
  type: BlockType;
  props: BlockProps;
}

export interface PageDocument {
  blocks: Block[];
}

export const defaultProps: Record<BlockType, BlockProps> = {
  Hero: {
    headline: "Judul Hero",
    subheadline: "Deskripsi singkat",
    buttonText: "Belanja Sekarang",
    buttonLink: "/toko",
    bgImage: "",
    overlay: true,
  } as HeroProps,
  TextBlock: {
    content: "Tulis teks di sini...",
    align: "left",
  } as TextBlockProps,
  ImageText: {
    headline: "Judul Section",
    content: "Deskripsi konten di sini.",
    imageUrl: "",
    imagePosition: "left",
    buttonText: "",
    buttonLink: "",
  } as ImageTextProps,
  CTABanner: {
    headline: "Dapatkan Penawaran Terbaik",
    subheadline: "Bergabunglah bersama ribuan pelanggan kami",
    buttonText: "Hubungi Kami",
    buttonLink: "/contact",
    bgColor: "#AF8442",
  } as CTABannerProps,
  ProductGrid: {
    headline: "Produk Kami",
    categorySlug: "",
    count: 4,
  } as ProductGridProps,
  FAQSection: {
    headline: "Pertanyaan Umum",
    items: [{ question: "Pertanyaan?", answer: "Jawaban." }],
  } as FAQSectionProps,
  FeatureIcons: {
    headline: "Kenapa Memilih Kami",
    items: [{ icon: "Shield", title: "Kualitas Terjamin", description: "Produk berkualitas tinggi." }],
  } as FeatureIconsProps,
  Spacer: {
    height: 40,
  } as SpacerProps,
};
