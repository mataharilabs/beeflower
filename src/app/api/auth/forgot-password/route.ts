import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { passwordResetEmail } from "@/lib/emails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://beeflowerbrand.co.id";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : null;

  if (!email) {
    return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
  }

  // Always return success — never reveal whether email exists
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { email: user.email, token, expiresAt },
      });

      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const brandSettings = await prisma.siteSettings.findUnique({
          where: { id: "singleton" },
          select: { logoUrl: true, logoWidth: true },
        }).catch(() => null);

        const resetUrl = `${APP_URL}/reset-password?token=${token}`;
        const emailContent = passwordResetEmail({
          name: user.name ?? user.email,
          resetUrl,
          logoUrl: brandSettings?.logoUrl,
          logoWidth: brandSettings?.logoWidth,
        });

        await resend.emails.send({
          from: emailContent.from,
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
        }).catch(console.error);
      }
    }
  } catch (e) {
    console.error("[forgot-password]", e);
  }

  return NextResponse.json({ success: true });
}
