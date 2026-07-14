interface FeatureItem {
  title: string;
  description: string;
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

export function WhyBeeFlower({ items }: { items?: FeatureItem[] }) {
  const features = items?.length ? items : DEFAULT_FEATURES;

  return (
    <section className="py-16 lg:py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
