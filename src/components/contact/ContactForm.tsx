"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";

export function ContactForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 6000);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h3 className="font-bold text-brand-brown text-xl">Pesan Terkirim!</h3>
        <p className="text-brand-brown/60 text-sm">
          Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1.5">
          Nama Lengkap
        </label>
        <input
          {...register("name")}
          placeholder="Masukan Nama Lengkap Anda"
          className="w-full px-4 py-3 border border-brand-beige rounded-lg text-sm text-brand-brown placeholder:text-brand-beige/60 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1.5">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="Masuka Email Anda"
          className="w-full px-4 py-3 border border-brand-beige rounded-lg text-sm text-brand-brown placeholder:text-brand-beige/60 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1.5">
          Pesan
        </label>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Tulis Pesan Anda Di Sini ..."
          className="w-full px-4 py-3 border border-brand-beige rounded-lg text-sm text-brand-brown placeholder:text-brand-beige/60 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 resize-none"
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-gold text-white font-semibold text-sm rounded-lg tracking-wide hover:bg-brand-brown transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isSubmitting ? "MENGIRIM..." : "KIRIM PESAN"}
      </button>
    </form>
  );
}
