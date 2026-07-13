"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Apakah produk Bee & Flower original?",
    answer:
      "Ya, semua produk yang kami jual adalah produk original Bee & Flower Brand yang telah dipercaya sejak tahun 1928. Kami berkomitmen untuk hanya menjual produk asli dengan kualitas terjamin.",
  },
  {
    question: "Apakah tersedia pengiriman ke seluruh Indonesia?",
    answer:
      "Ya, kami melayani pengiriman ke seluruh wilayah Indonesia. Kami bekerja sama dengan berbagai jasa pengiriman terpercaya untuk memastikan produk sampai ke tangan Anda dengan aman.",
  },
  {
    question: "Bagaimana cara menjadi reseller?",
    answer:
      "Untuk menjadi reseller Bee & Flower, Anda dapat mengunjungi halaman Reseller kami dan menghubungi tim kami melalui WhatsApp. Kami akan memberikan informasi lengkap mengenai program reseller dan harga khusus.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-6">
            F A Q
          </p>

          <div className="divide-y divide-brand-beige/30">
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => setOpen(open === index ? null : index)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span
                    className={cn(
                      "font-medium text-sm lg:text-base pr-4",
                      open === index ? "text-brand-gold" : "text-brand-brown"
                    )}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 flex-shrink-0 text-brand-gold transition-transform",
                      open === index ? "rotate-180" : ""
                    )}
                  />
                </button>
                {open === index && (
                  <div className="pb-5 text-sm text-brand-brown/70 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
