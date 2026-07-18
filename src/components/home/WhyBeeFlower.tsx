import { getBlockBgStyle, shouldShowOverlay, getOverlayStyle } from "@/lib/blockBackground";

interface FeatureItem {
  title: string;
  description: string;
}

interface Props {
  items?: FeatureItem[];
  bgProps?: any;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    title: "Aroma Khas yang Ikonik",
    description:
      "Keharuman yang menjadi ciri khas Bee & Flower memberikan pengalaman mandi yang menyegarkan dan berkesan.",
  },
  {
    title: "Formula Berkualitas",
    description:
      "Membersihkan kulit dengan lembut dan nyaman digunakan sebagai bagian dari rutinitas harian.",
  },
  {
    title: "Dipercaya Lintas Generasi",
    description:
      "Pilihan banyak keluarga yang tetap mempertahankan kualitas dan karakter aromanya hingga saat ini.",
  },
];

export function WhyBeeFlower({ items, bgProps }: Props) {
  const features = items?.length ? items : DEFAULT_FEATURES;
  const hasCustomBg = !!bgProps?.bgType;
  const bgStyle = hasCustomBg ? getBlockBgStyle(bgProps) : {};
  const showOverlay = hasCustomBg && shouldShowOverlay(bgProps);
  const overlayStyle = getOverlayStyle(bgProps);

  return (
    <section
      className={`relative py-16 lg:py-20 ${!hasCustomBg ? "bg-brand-cream" : ""}`}
      style={bgStyle}
    >
      {showOverlay && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-14 h-14 flex-shrink-0 bg-brand-gold/10 rounded-full flex items-center justify-center">
                <span className="text-brand-gold font-bold text-lg select-none">✦</span>
              </div>
              <div>
                <h3 className="font-bold text-brand-brown mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-brand-brown/70 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
