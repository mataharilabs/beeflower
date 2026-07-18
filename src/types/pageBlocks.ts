export type BlockType =
  | "Hero"
  | "TextBlock"
  | "ImageText"
  | "CTABanner"
  | "ProductGrid"
  | "FAQSection"
  | "FeatureIcons"
  | "Spacer";

export interface BackgroundProps {
  bgType: "image" | "color";
  bgImage: string;
  bgColor: string;
  bgImageFit?: "cover" | "contain" | "original";
  overlayEnabled: boolean;
  overlayColor: string;
  overlayOpacity: number; // 0–100
}

export interface HeroProps extends BackgroundProps {
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonLink: string;
  overlay?: boolean; // backward compat
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface TextBlockProps extends BackgroundProps {
  content: string;
  align: "left" | "center" | "right";
  contentColor?: string;
}

export interface ImageTextProps extends BackgroundProps {
  headline: string;
  content: string;
  imageUrl: string;
  imagePosition: "left" | "right";
  buttonText: string;
  buttonLink: string;
  headlineColor?: string;
  contentColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface CTABannerProps extends BackgroundProps {
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonLink: string;
  headlineColor?: string;
  subheadlineColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface ProductGridProps extends BackgroundProps {
  headline: string;
  categorySlug: string;
  count: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps extends BackgroundProps {
  headline: string;
  items: FAQItem[];
}

export interface FeatureIconItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureIconsProps extends BackgroundProps {
  headline: string;
  items: FeatureIconItem[];
  headlineColor?: string;
  itemTitleColor?: string;
  itemDescColor?: string;
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

const defaultBg: BackgroundProps = {
  bgType: "color",
  bgImage: "",
  bgColor: "",
  overlayEnabled: false,
  overlayColor: "#000000",
  overlayOpacity: 40,
};

export const defaultProps: Record<BlockType, BlockProps> = {
  Hero: {
    headline: "Judul Hero",
    subheadline: "Deskripsi singkat",
    buttonText: "Belanja Sekarang",
    buttonLink: "/toko",
    bgType: "image",
    bgImage: "",
    bgColor: "#1a1a2e",
    overlayEnabled: true,
    overlayColor: "#000000",
    overlayOpacity: 40,
  } as HeroProps,
  TextBlock: {
    content: "Tulis teks di sini...",
    align: "left",
    ...defaultBg,
  } as TextBlockProps,
  ImageText: {
    headline: "Judul Section",
    content: "Deskripsi konten di sini.",
    imageUrl: "",
    imagePosition: "left",
    buttonText: "",
    buttonLink: "",
    ...defaultBg,
  } as ImageTextProps,
  CTABanner: {
    headline: "Dapatkan Penawaran Terbaik",
    subheadline: "Bergabunglah bersama ribuan pelanggan kami",
    buttonText: "Hubungi Kami",
    buttonLink: "/contact",
    bgType: "color",
    bgImage: "",
    bgColor: "#AF8442",
    overlayEnabled: false,
    overlayColor: "#000000",
    overlayOpacity: 40,
  } as CTABannerProps,
  ProductGrid: {
    headline: "Produk Kami",
    categorySlug: "",
    count: 4,
    ...defaultBg,
  } as ProductGridProps,
  FAQSection: {
    headline: "Pertanyaan Umum",
    items: [{ question: "Pertanyaan?", answer: "Jawaban." }],
    bgType: "color",
    bgImage: "",
    bgColor: "",
    overlayEnabled: false,
    overlayColor: "#000000",
    overlayOpacity: 40,
  } as FAQSectionProps,
  FeatureIcons: {
    headline: "Kenapa Memilih Kami",
    items: [{ icon: "Shield", title: "Kualitas Terjamin", description: "Produk berkualitas tinggi." }],
    ...defaultBg,
  } as FeatureIconsProps,
  Spacer: {
    height: 40,
  } as SpacerProps,
};
