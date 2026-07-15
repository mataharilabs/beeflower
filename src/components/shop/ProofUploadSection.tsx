"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  logoUrl: string | null;
}

interface Props {
  orderId: string;
  bankAccounts: BankAccount[];
  hasExistingProof: boolean;
}

export function ProofUploadSection({ orderId, bankAccounts, hasExistingProof }: Props) {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(hasExistingProof);

  const handleSubmit = async () => {
    if (!proofUrl) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, imageUrl: proofUrl, bankAccountId: selectedBank || null }),
      });
      if (res.ok) {
        setSubmitted(true);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-700">
          Bukti pembayaran sudah diterima. Kami sedang memverifikasi dan akan segera memproses pesanan Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bankAccounts.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Pilih rekening tujuan transfer:</p>
          <div className="space-y-2">
            {bankAccounts.map((bank) => (
              <label
                key={bank.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedBank === bank.id ? "border-brand-gold bg-brand-cream" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="bank"
                  value={bank.id}
                  checked={selectedBank === bank.id}
                  onChange={() => setSelectedBank(bank.id)}
                  className="sr-only"
                />
                <div className="w-4 h-4 rounded-full border-2 border-brand-gold flex items-center justify-center flex-shrink-0">
                  {selectedBank === bank.id && <div className="w-2 h-2 bg-brand-gold rounded-full" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{bank.bankName}</p>
                  <p className="text-xs text-gray-500">{bank.accountHolder}</p>
                  <p className="text-sm font-mono text-gray-700 mt-0.5">{bank.accountNumber}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {bankAccounts.length > 0 ? "Upload foto bukti transfer:" : "Upload foto bukti pembayaran:"}
        </p>
        <ImageUploader value={proofUrl} onChange={setProofUrl} folder="beeflower/proofs" />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!proofUrl || submitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {bankAccounts.length > 0 ? "Kirim Bukti Transfer" : "Kirim Bukti Pembayaran"}
      </button>
    </div>
  );
}
