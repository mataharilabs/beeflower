// Craft.js node structure as serialized by editor.query.serialize()
export interface CraftNode {
  type: {
    resolvedName: string;
  };
  isCanvas?: boolean;
  props: Record<string, unknown>;
  displayName?: string;
  custom?: Record<string, unknown>;
  parent?: string;
  hidden?: boolean;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
}

export type CraftJson = Record<string, CraftNode>;

// Component props types for the page builder
export interface HeroSectionProps {
  headline: string;
  subheadline?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  align?: "left" | "center";
}

export interface TextBlockProps {
  content: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
}

export interface ImageTextSplitProps {
  headline: string;
  text: string;
  image: string;
  imagePosition?: "left" | "right";
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  title?: string;
  badge?: string;
  items: FAQItem[];
}

export interface FeatureItem {
  icon?: string;
  iconUrl?: string;
  heading: string;
  description: string;
}

export interface FeatureIconsProps {
  title?: string;
  badge?: string;
  columns?: 3 | 4 | 6;
  items: FeatureItem[];
}

export interface CTABannerProps {
  headline: string;
  subheadline?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  buttonText: string;
  buttonLink: string;
  badge?: string;
}

export interface ProductGridProps {
  title?: string;
  badge?: string;
  subtitle?: string;
  filter?: "featured" | "bestseller" | "category";
  categoryId?: string;
  limit?: number;
}

export interface BannerSliderProps {
  autoplay?: boolean;
  interval?: number;
}

export interface SpacerProps {
  height?: number;
}

export type CraftComponent =
  | { type: "HeroSection"; props: HeroSectionProps }
  | { type: "TextBlock"; props: TextBlockProps }
  | { type: "ImageTextSplit"; props: ImageTextSplitProps }
  | { type: "FAQSection"; props: FAQSectionProps }
  | { type: "FeatureIcons"; props: FeatureIconsProps }
  | { type: "CTABanner"; props: CTABannerProps }
  | { type: "ProductGrid"; props: ProductGridProps }
  | { type: "BannerSlider"; props: BannerSliderProps }
  | { type: "Spacer"; props: SpacerProps };
