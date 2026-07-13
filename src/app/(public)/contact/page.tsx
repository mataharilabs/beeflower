import { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Us - Bee & Flower Brand",
  description:
    "Hubungi kami untuk informasi produk, pemesanan, atau kerja sama reseller.",
};

export default async function ContactPage() {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[300px] lg:min-h-[380px] overflow-hidden bg-brand-cream flex items-center">
        <div className="absolute right-0 top-0 h-full w-1/2 hidden lg:block">
          <Image
            src="/images/contact-hero.jpg"
            alt="Contact Bee & Flower"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/60 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full">
          <div className="max-w-xl">
            <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-3">
              Contact Us
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-brand-brown leading-tight mb-4">
              Hubungi Kami
            </h1>
            <p className="text-brand-brown/60 text-base leading-relaxed max-w-sm">
              Kami siap membantu kebutuhan informasi produk maupun kerja sama reseller.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info Card */}
            <div className="border border-brand-beige/30 rounded-2xl p-6 lg:p-8">
              <h2 className="font-bold text-brand-brown text-center tracking-widest uppercase text-sm mb-8">
                Informasi Kontak
              </h2>

              <div className="space-y-6">
                {settings?.whatsapp && (
                  <div className="flex items-start gap-4 pb-6 border-b border-brand-beige/20">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm">WhatsApp</p>
                      <a
                        href={`https://wa.me/${settings.whatsapp}`}
                        className="text-brand-brown/70 text-sm hover:text-brand-gold transition-colors"
                      >
                        {settings.whatsapp.replace("62", "0").replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3")}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.email && (
                  <div className="flex items-start gap-4 pb-6 border-b border-brand-beige/20">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm">E-mail</p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-brand-brown/70 text-sm hover:text-brand-gold transition-colors"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.address && (
                  <div className="flex items-start gap-4 pb-6 border-b border-brand-beige/20">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm">Alamat</p>
                      <p className="text-brand-brown/70 text-sm whitespace-pre-line">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}

                {settings?.businessHours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-brown text-sm mb-1">
                        Jam Operasional
                      </p>
                      <p className="text-brand-brown/70 text-sm whitespace-pre-line leading-relaxed">
                        {settings.businessHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="border border-brand-beige/30 rounded-2xl p-6 lg:p-8">
              <h2 className="font-bold text-brand-brown text-center tracking-widest uppercase text-sm mb-8">
                Formulir Kontak
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      {settings?.googleMapsEmbed && (
        <section className="h-[400px] w-full overflow-hidden">
          <iframe
            src={settings.googleMapsEmbed}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Bee & Flower Brand"
          />
        </section>
      )}
    </>
  );
}
