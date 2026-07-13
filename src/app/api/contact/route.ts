import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactFormSchema.parse(body);

    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });

    // Send email notification to admin
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@beeflowerbrand.com",
        to: process.env.ADMIN_EMAIL,
        subject: `Pesan Baru dari ${data.name} - Bee & Flower`,
        html: `
          <h2>Pesan Baru dari Form Kontak</h2>
          <p><strong>Nama:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Pesan:</strong></p>
          <p>${data.message}</p>
          <hr/>
          <p style="color:#666;font-size:12px">Dikirim dari website Bee & Flower Brand</p>
        `,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, id: message.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan" },
      { status: 500 }
    );
  }
}
