import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Block, PageDocument, HeroProps, TextBlockProps, ImageTextProps, CTABannerProps, ProductGridProps, FAQSectionProps, FeatureIconsProps, SpacerProps, ImageGridProps } from "@/types/pageBlocks";
import { formatPrice } from "@/lib/utils";
import { getBlockBgStyle, shouldShowOverlay, getOverlayStyle } from "@/lib/blockBackground";
import {
  Leaf, Droplets, Sun, Moon, Wind, Flame, Feather,
  Heart, Star, Sparkles, Shield, CheckCircle, Award, Crown,
  ThumbsUp, Smile, Users, Globe, Lock, Eye,
  Package, Gift, ShoppingBag, Tag, Truck, RefreshCw, Clock, Zap,
  Layers, Palette, Scissors, Camera, Coffee, Bell, Bookmark, Gem,
} from "lucide-react";

const FEATURE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf, Droplets, Sun, Moon, Wind, Flame, Feather,
  Heart, Star, Sparkles, Shield, CheckCircle, Award, Crown,
  ThumbsUp, Smile, Users, Globe, Lock, Eye,
  Package, Gift, ShoppingBag, Tag, Truck, RefreshCw, Clock, Zap,
  Layers, Palette, Scissors, Camera, Coffee, Bell, Bookmark, Gem,
};

export function BlockRenderer({ document }: { document: object }) {
  const doc = document as PageDocument;
  const blocks: Block[] = Array.isArray(doc?.blocks) ? doc.blocks : [];

  if (blocks.length === 0) return null;

  return (
    <div>
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case "Hero":
      return <HeroBlock props={block.props as HeroProps} />;
    case "TextBlock":
      return <TextBlock props={block.props as TextBlockProps} />;
    case "ImageText":
      return <ImageTextBlock props={block.props as ImageTextProps} />;
    case "CTABanner":
      return <CTABannerBlock props={block.props as CTABannerProps} />;
    case "ProductGrid":
      return <ProductGridBlock props={block.props as ProductGridProps} />;
    case "FAQSection":
      return <FAQSectionBlock props={block.props as FAQSectionProps} />;
    case "FeatureIcons":
      return <FeatureIconsBlock props={block.props as FeatureIconsProps} />;
    case "Spacer":
      return <SpacerBlock props={block.props as SpacerProps} />;
    case "ImageGrid":
      return <ImageGridBlock props={block.props as ImageGridProps} />;
    default:
      return null;
  }
}

function BlockOverlay({ props }: { props: any }) {
  if (!shouldShowOverlay(props)) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={getOverlayStyle(props)}
    />
  );
}

function HeroBlock({ props }: { props: HeroProps }) {
  const align = props.textAlign ?? "center";
  const textAlignClass = align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  const itemsClass = align === "left" ? "items-start" : align === "right" ? "items-end" : "items-center";
  const maxWClass = align === "center" ? "max-w-2xl mx-auto" : "max-w-5xl mx-auto";
  const btnStyle = {
    ...(props.buttonBgColor ? { backgroundColor: props.buttonBgColor } : {}),
    ...(props.buttonTextColor ? { color: props.buttonTextColor } : {}),
  };
  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center bg-brand-brown text-white"
      style={getBlockBgStyle(props)}
    >
      <BlockOverlay props={props} />
      <div className={`relative z-10 ${maxWClass} px-4 flex flex-col ${itemsClass} ${textAlignClass}`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={props.headlineColor ? { color: props.headlineColor } : {}}>{props.headline}</h1>
        {props.subheadline && (
          <p className="text-lg text-white/90 mb-4" style={props.subheadlineColor ? { color: props.subheadlineColor } : {}}>{props.subheadline}</p>
        )}
        {props.subSubheadline && (
          <p className="text-sm text-white/70 mb-8" style={props.subSubheadlineColor ? { color: props.subSubheadlineColor } : {}}>{props.subSubheadline}</p>
        )}
        {props.buttonText && (
          <Link href={props.buttonLink || "/"} style={btnStyle} className="inline-block px-8 py-3 bg-brand-gold text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
            {props.buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}

function TextBlock({ props }: { props: TextBlockProps }) {
  const hasBg = props.bgType !== undefined;
  const alignClass = `text-${props.align ?? "left"}`;
  return (
    <section className="relative py-12 px-4" style={hasBg ? getBlockBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className={`relative z-10 max-w-3xl mx-auto ${alignClass}`}>
        {props.subHeadline && (
          <p
            className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-2"
            style={props.subHeadlineColor ? { color: props.subHeadlineColor } : {}}
          >
            {props.subHeadline}
          </p>
        )}
        {props.headline && (
          <h2
            className="text-3xl font-bold text-brand-brown mb-4"
            style={props.headlineColor ? { color: props.headlineColor } : {}}
          >
            {props.headline}
          </h2>
        )}
        {props.content && (
          <div
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            style={props.contentColor ? { color: props.contentColor } : {}}
          >
            {props.content}
          </div>
        )}
      </div>
    </section>
  );
}

function ImageTextBlock({ props }: { props: ImageTextProps }) {
  const isLeft = props.imagePosition !== "right";
  const hasBg = props.bgType !== undefined;
  const hasImage = !!props.imageUrl;
  const btnStyle = {
    ...(props.buttonBgColor ? { backgroundColor: props.buttonBgColor } : {}),
    ...(props.buttonTextColor ? { color: props.buttonTextColor } : {}),
  };
  return (
    <section className="relative py-16 px-4" style={hasBg ? getBlockBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className={`relative z-10 max-w-5xl mx-auto flex flex-col ${hasImage ? (isLeft ? "md:flex-row" : "md:flex-row-reverse") : ""} gap-10 items-center`}>
        {hasImage && (
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden">
            <img src={props.imageUrl} alt={props.headline} className="w-full h-80 object-cover" />
          </div>
        )}
        <div className={`w-full ${hasImage ? "md:w-1/2" : ""}`}>
          {props.subHeadline && (
            <p
              className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-2"
              style={props.subHeadlineColor ? { color: props.subHeadlineColor } : {}}
            >
              {props.subHeadline}
            </p>
          )}
          <h2 className="text-3xl font-bold text-brand-brown mb-4" style={props.headlineColor ? { color: props.headlineColor } : {}}>{props.headline}</h2>
          <p className="text-gray-600 leading-relaxed mb-6" style={props.contentColor ? { color: props.contentColor } : {}}>{props.content}</p>
          {props.buttonText && (
            <Link href={props.buttonLink || "/"} style={btnStyle} className="inline-block px-6 py-2.5 bg-brand-gold text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
              {props.buttonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function CTABannerBlock({ props }: { props: CTABannerProps }) {
  const btnStyle = {
    ...(props.buttonBgColor ? { backgroundColor: props.buttonBgColor } : {}),
    ...(props.buttonTextColor ? { color: props.buttonTextColor } : {}),
  };
  const align = props.align ?? "center";
  const alignClass = `text-${align}`;
  const itemsClass = align === "left" ? "items-start" : align === "right" ? "items-end" : "items-center";
  const maxWClass = align === "center" ? "max-w-2xl mx-auto" : "max-w-5xl mx-auto";
  return (
    <section className="relative py-16 px-4 text-white" style={getBlockBgStyle(props)}>
      <BlockOverlay props={props} />
      <div className={`relative z-10 ${maxWClass} flex flex-col ${itemsClass} ${alignClass}`}>
        <h2 className="text-3xl font-bold mb-3" style={props.headlineColor ? { color: props.headlineColor } : {}}>{props.headline}</h2>
        {props.subheadline && (
          <p className="text-lg text-white/90 mb-8" style={props.subheadlineColor ? { color: props.subheadlineColor } : {}}>{props.subheadline}</p>
        )}
        {props.buttonText && (
          <Link href={props.buttonLink || "/"} style={btnStyle} className="inline-block px-8 py-3 bg-white text-brand-brown rounded-full font-bold hover:opacity-90 transition-opacity">
            {props.buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}

async function ProductGridBlock({ props }: { props: ProductGridProps }) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(props.categorySlug ? { category: { slug: props.categorySlug } } : {}),
    },
    take: props.count || 4,
    include: { category: true },
  });

  const hasBg = props.bgType !== undefined;
  return (
    <section className="relative py-16 px-4" style={hasBg ? getBlockBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className="relative z-10 max-w-6xl mx-auto">
        {(props.subHeadline || props.headline) && (
          <div className="text-center mb-10">
            {props.subHeadline && (
              <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-2"
                style={(props as any).subHeadlineColor ? { color: (props as any).subHeadlineColor } : {}}>
                {props.subHeadline}
              </p>
            )}
            {props.headline && (
              <h2 className="text-3xl font-bold text-brand-brown"
                style={(props as any).headlineColor ? { color: (props as any).headlineColor } : {}}>
                {props.headline}
              </h2>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((product) => (
            <Link key={product.id} href={`/toko/${product.slug}`} className="group">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-brand-cream overflow-hidden">
                  {product.images[0] && (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                    <p className="text-brand-gold font-bold text-sm">
                      {formatPrice(Number(product.price.toString()))}
                    </p>
                    {product.comparePrice && Number(product.comparePrice.toString()) > Number(product.price.toString()) && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(Number(product.comparePrice.toString()))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSectionBlock({ props }: { props: FAQSectionProps }) {
  const hasBg = props.bgType !== undefined;
  const bgStyle = hasBg ? getBlockBgStyle(props) : {};
  // Fall back to brand-cream when no background is explicitly configured
  const fallbackClass = !hasBg || (!props.bgImage && !props.bgColor) ? "bg-brand-cream" : "";
  return (
    <section className={`relative py-16 px-4 ${fallbackClass}`} style={bgStyle}>
      {hasBg && <BlockOverlay props={props} />}
      <div className="relative z-10 max-w-3xl mx-auto">
        {props.headline && (
          <h2 className="text-3xl font-bold text-brand-brown text-center mb-10">{props.headline}</h2>
        )}
        <div className="space-y-4">
          {(props.items ?? []).map((item, i) => (
            <details key={i} className="bg-white rounded-xl p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                {item.question}
                <span className="text-brand-gold ml-2">+</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIconsBlock({ props }: { props: FeatureIconsProps }) {
  const hasBg = props.bgType !== undefined;
  return (
    <section className="relative py-16 px-4" style={hasBg ? getBlockBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className="relative z-10 max-w-5xl mx-auto">
        {(props.subHeadline || props.headline) && (
          <div className="text-center mb-10">
            {props.subHeadline && (
              <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-2"
                style={props.subHeadlineColor ? { color: props.subHeadlineColor } : {}}>
                {props.subHeadline}
              </p>
            )}
            {props.headline && (
              <h2 className="text-3xl font-bold text-brand-brown"
                style={props.headlineColor ? { color: props.headlineColor } : {}}>
                {props.headline}
              </h2>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(props.items ?? []).map((item, i) => (
            <div key={i} className="text-center p-6 bg-brand-cream rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                ) : item.iconName && FEATURE_ICON_MAP[item.iconName] ? (
                  (() => { const Icon = FEATURE_ICON_MAP[item.iconName!]; return <Icon className="w-10 h-10 text-brand-gold" />; })()
                ) : (
                  <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                    <span className="text-brand-gold text-xl">✦</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-2" style={props.itemTitleColor ? { color: props.itemTitleColor } : {}}>{item.title}</h3>
              <p className="text-gray-600 text-sm" style={props.itemDescColor ? { color: props.itemDescColor } : {}}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpacerBlock({ props }: { props: SpacerProps }) {
  return <div style={{ height: `${props.height ?? 40}px` }} />;
}

function ImageGridBlock({ props }: { props: ImageGridProps }) {
  const hasBg = props.bgType !== undefined;
  const colClass = props.columns === 1 ? "grid-cols-1" : props.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  const filled = (props.items ?? []).filter((item) => item.url);
  if (filled.length === 0) return null;
  const hasAnyText = filled.some((item) => item.subHeadline || item.headline || item.buttonText);
  return (
    <section className="relative py-12 px-4" style={hasBg ? getBlockBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className={`relative z-10 max-w-5xl mx-auto grid ${colClass} gap-4`}>
        {filled.map((item, i) => (
          <div key={i} className={`overflow-hidden rounded-xl ${hasAnyText ? "bg-white shadow-sm" : ""}`}>
            {item.buttonLink ? (
              <Link href={item.buttonLink} className="block">
                <img
                  src={item.url}
                  alt={item.alt ?? item.headline ?? ""}
                  className="w-full object-cover hover:opacity-90 transition-opacity"
                />
              </Link>
            ) : (
              <img
                src={item.url}
                alt={item.alt ?? item.headline ?? ""}
                className="w-full object-cover"
              />
            )}
            {(item.subHeadline || item.headline || item.buttonText) && (
              <div className="p-4">
                {item.subHeadline && (
                  <p className="text-brand-gold font-semibold text-xs tracking-widest uppercase mb-1">
                    {item.subHeadline}
                  </p>
                )}
                {item.headline && (
                  <h3 className="font-bold text-brand-brown text-base mb-2">{item.headline}</h3>
                )}
                {item.buttonText && (
                  <Link
                    href={item.buttonLink || "/"}
                    className="inline-block px-4 py-1.5 bg-brand-gold text-white text-sm rounded-full font-semibold hover:opacity-90 transition-opacity"
                  >
                    {item.buttonText}
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
