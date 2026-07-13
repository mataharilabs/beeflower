import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Bee & Flower Brand",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="font-bold text-2xl text-brand-brown">
            .BEE <span className="text-brand-gold">&</span>FLOWER
          </h1>
          <p className="text-sm text-brand-beige mt-1">Masuk ke akun Anda</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
