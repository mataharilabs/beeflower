import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Block, PageDocument, HeroProps, TextBlockProps, ImageTextProps, CTABannerProps, ProductGridProps, FAQSectionProps, FeatureIconsProps, SpacerProps } from "@/types/pageBlocks";
import { formatPrice } from "@/lib/utils";

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
    default:
      return null;
  }
}

function getBgStyle(props: any): React.CSSProperties {
  if (props.bgType === "image" && props.bgImage) {
    return { backgroundImage: `url(${props.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  if (props.bgType === "color" && props.bgColor) {
    return { backgroundColor: props.bgColor };
  }
  // backward compat: Hero had bgImage without bgType
  if (!props.bgType && props.bgImage) {
    return { backgroundImage: `url(${props.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  // backward compat: CTABanner had bgColor without bgType
  if (!props.bgType && props.bgColor) {
    return { backgroundColor: props.bgColor };
  }
  return {};
}

function BlockOverlay({ props }: { props: any }) {
  // New system
  if (props.bgType !== undefined) {
    if (!props.overlayEnabled) return null;
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: props.overlayColor ?? "#000000",
          opacity: (props.overlayOpacity ?? 40) / 100,
        }}
      />
    );
  }
  // backward compat: Hero's old `overlay` boolean
  if (props.overlay && props.bgImage) {
    return <div className="absolute inset-0 bg-black/40 pointer-events-none" />;
  }
  return null;
}

function HeroBlock({ props }: { props: HeroProps }) {
  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center bg-brand-brown text-white"
      style={getBgStyle(props)}
    >
      <BlockOverlay props={props} />
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{props.headline}</h1>
        {props.subheadline && <p className="text-lg text-white/90 mb-8">{props.subheadline}</p>}
        {props.buttonText && (
          <Link href={props.buttonLink || "/"} className="inline-block px-8 py-3 bg-brand-gold text-white rounded-full font-semibold hover:bg-white hover:text-brand-brown transition-colors">
            {props.buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}

function TextBlock({ props }: { props: TextBlockProps }) {
  const hasBg = props.bgType !== undefined;
  return (
    <section className="relative py-12 px-4" style={hasBg ? getBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className={`relative z-10 max-w-3xl mx-auto text-gray-700 leading-relaxed whitespace-pre-wrap text-${props.align ?? "left"}`}>
        {props.content}
      </div>
    </section>
  );
}

function ImageTextBlock({ props }: { props: ImageTextProps }) {
  const isLeft = props.imagePosition !== "right";
  const hasBg = props.bgType !== undefined;
  return (
    <section className="relative py-16 px-4" style={hasBg ? getBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className={`relative z-10 max-w-5xl mx-auto flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-center`}>
        {props.imageUrl && (
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden">
            <img src={props.imageUrl} alt={props.headline} className="w-full h-80 object-cover" />
          </div>
        )}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold text-brand-brown mb-4">{props.headline}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{props.content}</p>
          {props.buttonText && (
            <Link href={props.buttonLink || "/"} className="inline-block px-6 py-2.5 bg-brand-gold text-white rounded-full font-semibold hover:bg-brand-brown transition-colors">
              {props.buttonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function CTABannerBlock({ props }: { props: CTABannerProps }) {
  return (
    <section className="relative py-16 px-4 text-white text-center" style={getBgStyle(props)}>
      <BlockOverlay props={props} />
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-3">{props.headline}</h2>
        {props.subheadline && <p className="text-lg text-white/90 mb-8">{props.subheadline}</p>}
        {props.buttonText && (
          <Link href={props.buttonLink || "/"} className="inline-block px-8 py-3 bg-white text-brand-brown rounded-full font-bold hover:bg-brand-cream transition-colors">
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
    <section className="relative py-16 px-4" style={hasBg ? getBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className="relative z-10 max-w-6xl mx-auto">
        {props.headline && (
          <h2 className="text-3xl font-bold text-brand-brown text-center mb-10">{props.headline}</h2>
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
                  <p className="text-brand-gold font-bold text-sm mt-1">
                    {formatPrice(Number(product.price.toString()))}
                  </p>
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
  const bgStyle = hasBg ? getBgStyle(props) : {};
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
    <section className="relative py-16 px-4" style={hasBg ? getBgStyle(props) : {}}>
      {hasBg && <BlockOverlay props={props} />}
      <div className="relative z-10 max-w-5xl mx-auto">
        {props.headline && (
          <h2 className="text-3xl font-bold text-brand-brown text-center mb-10">{props.headline}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(props.items ?? []).map((item, i) => (
            <div key={i} className="text-center p-6 bg-brand-cream rounded-xl">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-gold text-xl">✦</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
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
