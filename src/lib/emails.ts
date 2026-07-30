const BRAND_GOLD = "#AF8442";
const BRAND_BROWN = "#3A2D1D";
const BRAND_CREAM = "#F8F1EA";
const BRAND_BEIGE = "#BEAA92";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://beeflowerbrand.co.id";
const FROM = process.env.EMAIL_FROM ?? "noreply@beeflowerbrand.co.id";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function emailWrapper(content: string, logoUrl?: string | null, logoWidth?: number | null) {
  const emailLogoWidth = Math.min(logoWidth ?? 160, 200);
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Bee &amp; Flower Brand" style="display:block;margin:0 auto;height:auto;max-height:52px;max-width:${emailLogoWidth}px;width:auto" />`
    : `<p style="margin:0;color:${BRAND_GOLD};font-size:22px;font-weight:bold;letter-spacing:3px">BEE &amp; FLOWER</p><p style="margin:4px 0 0;color:${BRAND_BEIGE};font-size:11px;letter-spacing:2px;text-transform:uppercase">Brand</p>`;

  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%">
        <tr><td style="background:${BRAND_BROWN};padding:24px 32px;text-align:center">
          ${logoHtml}
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="background:${BRAND_CREAM};padding:20px 32px;text-align:center;border-top:1px solid #e0d5c8">
          <p style="margin:0;color:${BRAND_BEIGE};font-size:12px">Bee &amp; Flower Brand &mdash; beeflowerbrand.co.id</p>
          <p style="margin:4px 0 0;color:#aaa;font-size:11px">Email ini dikirim otomatis, mohon tidak membalas.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// --- Order Confirmation ---

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export function orderConfirmationEmail(data: {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  logoUrl?: string | null;
  logoWidth?: number | null;
  shippingCost?: number;
  shippingService?: string | null;
  orderId?: string;
  bankAccounts?: { bankName: string; accountHolder: string; accountNumber: string; logoUrl?: string | null }[];
  qrisImageUrl?: string | null;
  couponCode?: string | null;
  couponDiscount?: number;
}) {
  const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemRows = data.items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8df;color:${BRAND_BROWN}">${item.productName}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8df;color:#666;text-align:center">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8df;color:${BRAND_BROWN};text-align:right">${formatRupiah(item.price * item.quantity)}</td>
    </tr>`).join("");

  const orderDetailUrl = data.orderId ? `${APP_URL}/toko/pesanan/${data.orderId}` : `${APP_URL}/member/orders`;

  let paymentNote: string;
  if (data.paymentMethod === "MANUAL_TRANSFER") {
    const bankCards = (data.bankAccounts ?? []).map((b) => `
      <div style="background:#fff;border:1px solid #e0d5c8;border-radius:6px;padding:12px 16px;margin:8px 0">
        <p style="margin:0 0 2px;font-weight:bold;color:${BRAND_BROWN};font-size:14px">${b.bankName}</p>
        <p style="margin:0 0 4px;color:#888;font-size:12px">${b.accountHolder}</p>
        <p style="margin:0;font-family:monospace;font-size:17px;font-weight:bold;color:${BRAND_BROWN};letter-spacing:1px">${b.accountNumber}</p>
      </div>`).join("");
    paymentNote = `<div style="background:${BRAND_CREAM};border-left:4px solid ${BRAND_GOLD};padding:16px;margin:24px 0;border-radius:0 4px 4px 0">
      <p style="margin:0 0 10px;font-weight:bold;color:${BRAND_BROWN}">Langkah Selanjutnya</p>
      <p style="margin:0 0 10px;color:#555;font-size:14px">Silakan transfer sejumlah total di atas ke salah satu rekening berikut:</p>
      ${bankCards || `<p style="color:#888;font-size:13px">Hubungi kami untuk informasi rekening.</p>`}
      <a href="${orderDetailUrl}" style="display:inline-block;margin-top:14px;padding:10px 20px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-size:13px">Upload Bukti Transfer</a>
    </div>`;
  } else if (data.paymentMethod === "QRIS") {
    const qrImg = data.qrisImageUrl
      ? `<div style="text-align:center;margin:14px 0"><img src="${data.qrisImageUrl}" alt="QRIS QR Code" style="max-width:220px;width:100%;border-radius:8px;border:1px solid #e0d5c8" /></div>`
      : "";
    paymentNote = `<div style="background:${BRAND_CREAM};border-left:4px solid ${BRAND_GOLD};padding:16px;margin:24px 0;border-radius:0 4px 4px 0">
      <p style="margin:0 0 10px;font-weight:bold;color:${BRAND_BROWN}">Pembayaran QRIS</p>
      <p style="margin:0 0 8px;color:#555;font-size:14px">Scan QR code berikut dengan e-wallet atau mobile banking Anda:</p>
      ${qrImg}
      <a href="${orderDetailUrl}" style="display:inline-block;margin-top:10px;padding:10px 20px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-size:13px">Upload Bukti Pembayaran</a>
    </div>`;
  } else {
    paymentNote = `<div style="background:${BRAND_CREAM};border-left:4px solid ${BRAND_GOLD};padding:16px;margin:24px 0;border-radius:0 4px 4px 0">
      <p style="margin:0 0 10px;font-weight:bold;color:${BRAND_BROWN}">Selesaikan Pembayaran</p>
      <p style="margin:0 0 12px;color:#555;font-size:14px">Klik tombol di bawah untuk melanjutkan pembayaran online Anda.</p>
      <a href="${orderDetailUrl}" style="display:inline-block;padding:10px 20px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-size:13px;font-weight:bold">Lanjutkan Pembayaran</a>
    </div>`;
  }

  const html = emailWrapper(`
    <h2 style="margin:0 0 4px;color:${BRAND_BROWN};font-size:20px">Pesanan Dikonfirmasi!</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px">Halo <strong>${data.customerName}</strong>, terima kasih telah berbelanja di Bee & Flower Brand.</p>
    <div style="background:${BRAND_CREAM};padding:14px 20px;border-radius:6px;margin-bottom:24px">
      <p style="margin:0;font-size:13px;color:#888">Nomor Pesanan</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:${BRAND_BROWN};letter-spacing:1px">#${data.orderNumber}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
      <thead>
        <tr style="border-bottom:2px solid ${BRAND_BEIGE}">
          <th style="padding:8px 0;text-align:left;font-size:12px;color:#888;font-weight:normal;text-transform:uppercase;letter-spacing:1px">Produk</th>
          <th style="padding:8px 0;text-align:center;font-size:12px;color:#888;font-weight:normal;text-transform:uppercase;letter-spacing:1px">Qty</th>
          <th style="padding:8px 0;text-align:right;font-size:12px;color:#888;font-weight:normal;text-transform:uppercase;letter-spacing:1px">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:10px 0 0;color:#888;font-size:13px">Subtotal</td>
          <td style="padding:10px 0 0;color:${BRAND_BROWN};text-align:right">${formatRupiah(subtotal)}</td>
        </tr>
        ${data.shippingCost && data.shippingCost > 0 ? `<tr>
          <td colspan="2" style="padding:4px 0 0;color:#888;font-size:13px">Ongkos Kirim${data.shippingService ? ` (${data.shippingService})` : ""}</td>
          <td style="padding:4px 0 0;color:${BRAND_BROWN};text-align:right">${formatRupiah(data.shippingCost)}</td>
        </tr>` : ""}
        ${data.couponDiscount && data.couponDiscount > 0 ? `<tr>
          <td colspan="2" style="padding:4px 0 0;color:#888;font-size:13px">Diskon Kupon${data.couponCode ? ` (${data.couponCode})` : ""}</td>
          <td style="padding:4px 0 0;color:#d32f2f;text-align:right">-${formatRupiah(data.couponDiscount)}</td>
        </tr>` : ""}
        <tr>
          <td colspan="2" style="padding:10px 0 0;font-weight:bold;color:${BRAND_BROWN};border-top:1px solid ${BRAND_BEIGE}">Total</td>
          <td style="padding:10px 0 0;font-weight:bold;color:${BRAND_GOLD};text-align:right;font-size:18px;border-top:1px solid ${BRAND_BEIGE}">${formatRupiah(data.total)}</td>
        </tr>
      </tfoot>
    </table>
    ${paymentNote}
  `, data.logoUrl, data.logoWidth);

  return {
    subject: `Pesanan #${data.orderNumber} Dikonfirmasi - Bee & Flower Brand`,
    html,
    from: FROM,
  };
}

// --- Payment Received (to admin) ---

export function paymentReceivedEmail(data: {
  orderNumber: string;
  customerName: string;
  orderId: string;
}) {
  const adminUrl = `${APP_URL}/admin/payment-proof`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 4px;color:${BRAND_BROWN};font-size:20px">Bukti Transfer Masuk</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px">Customer telah mengupload bukti transfer untuk pesanan berikut:</p>
    <div style="background:${BRAND_CREAM};padding:16px 20px;border-radius:6px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Nomor Pesanan</p>
      <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${BRAND_BROWN}">#${data.orderNumber}</p>
      <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Nama Customer</p>
      <p style="margin:0;color:${BRAND_BROWN};font-weight:bold">${data.customerName}</p>
    </div>
    <a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold">Verifikasi Sekarang</a>
  `);

  return {
    subject: `Bukti Transfer Baru - Pesanan #${data.orderNumber}`,
    html,
    from: FROM,
  };
}

// --- Payment Verified / Rejected (to customer) ---

export function paymentVerifiedEmail(data: {
  orderNumber: string;
  customerName: string;
  action: "verify" | "reject";
  reviewNotes?: string | null;
}) {
  const isVerified = data.action === "verify";

  const statusBadge = isVerified
    ? `<div style="display:inline-block;background:#d4edda;color:#155724;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:bold">Pembayaran Terverifikasi</div>`
    : `<div style="display:inline-block;background:#f8d7da;color:#721c24;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:bold">Pembayaran Ditolak</div>`;

  const message = isVerified
    ? `Pembayaran Anda untuk pesanan <strong>#${data.orderNumber}</strong> telah <strong>diverifikasi</strong>. Kami akan segera memproses pesanan Anda.`
    : `Maaf, bukti transfer untuk pesanan <strong>#${data.orderNumber}</strong> tidak dapat diverifikasi.${data.reviewNotes ? ` Alasan: <em>${data.reviewNotes}</em>` : ""} Silakan hubungi kami atau upload ulang bukti transfer yang valid.`;

  const ctaButton = isVerified
    ? `<a href="${APP_URL}/toko/pesanan" style="display:inline-block;margin-top:20px;padding:12px 24px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold">Lacak Pesanan</a>`
    : `<a href="${APP_URL}/toko/pesanan" style="display:inline-block;margin-top:20px;padding:12px 24px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold">Lihat Pesanan</a>`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 4px;color:${BRAND_BROWN};font-size:20px">${isVerified ? "Pembayaran Dikonfirmasi!" : "Info Pembayaran"}</h2>
    <p style="margin:0 0 20px;color:#666;font-size:14px">Halo <strong>${data.customerName}</strong>,</p>
    <div style="margin-bottom:20px">${statusBadge}</div>
    <p style="color:#555;font-size:14px;line-height:1.6">${message}</p>
    ${ctaButton}
    <p style="margin-top:24px;color:#aaa;font-size:12px">Butuh bantuan? Hubungi kami melalui halaman <a href="${APP_URL}/contact" style="color:${BRAND_GOLD}">Kontak</a>.</p>
  `);

  return {
    subject: isVerified
      ? `Pembayaran Dikonfirmasi - Pesanan #${data.orderNumber}`
      : `Info Pembayaran - Pesanan #${data.orderNumber}`,
    html,
    from: FROM,
  };
}

// --- Order Status Update (to customer) ---

const STATUS_CONFIG: Record<string, { label: string; badgeBg: string; badgeColor: string; message: string }> = {
  PAID:       { label: "Pembayaran Diterima", badgeBg: "#d4edda", badgeColor: "#155724", message: "Pembayaran Anda telah kami terima. Pesanan segera kami proses." },
  PROCESSING: { label: "Sedang Diproses",     badgeBg: "#cce5ff", badgeColor: "#004085", message: "Pesanan Anda sedang kami persiapkan untuk pengiriman." },
  SHIPPED:    { label: "Sedang Dikirim",      badgeBg: "#d1ecf1", badgeColor: "#0c5460", message: "Pesanan Anda sudah dalam perjalanan menuju alamat Anda." },
  DELIVERED:  { label: "Pesanan Diterima",    badgeBg: "#c3e6cb", badgeColor: "#1b5e20", message: "Pesanan Anda telah tiba. Terima kasih telah berbelanja di Bee & Flower Brand!" },
  CANCELLED:  { label: "Pesanan Dibatalkan",  badgeBg: "#f8d7da", badgeColor: "#721c24", message: "Pesanan Anda telah dibatalkan. Hubungi kami jika ada pertanyaan." },
};

export function orderStatusEmail(data: {
  orderNumber: string;
  customerName: string;
  status: string;
  logoUrl?: string | null;
  logoWidth?: number | null;
}) {
  const cfg = STATUS_CONFIG[data.status] ?? { label: data.status, badgeBg: BRAND_CREAM, badgeColor: BRAND_BROWN, message: "Status pesanan Anda telah diperbarui." };

  const html = emailWrapper(`
    <h2 style="margin:0 0 4px;color:${BRAND_BROWN};font-size:20px">Update Pesanan</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px">Halo <strong>${data.customerName}</strong>,</p>
    <div style="background:${BRAND_CREAM};padding:14px 20px;border-radius:6px;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#888">Nomor Pesanan</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:${BRAND_BROWN};letter-spacing:1px">#${data.orderNumber}</p>
    </div>
    <div style="margin-bottom:20px">
      <span style="display:inline-block;background:${cfg.badgeBg};color:${cfg.badgeColor};padding:8px 20px;border-radius:20px;font-size:14px;font-weight:bold">${cfg.label}</span>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">${cfg.message}</p>
    <a href="${APP_URL}/member/orders" style="display:inline-block;padding:12px 24px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold">Lihat Detail Pesanan</a>
  `, data.logoUrl, data.logoWidth);

  return {
    subject: `Pesanan #${data.orderNumber} — ${cfg.label}`,
    html,
    from: FROM,
  };
}

// --- Password Reset (to customer) ---

export function passwordResetEmail(data: {
  name: string;
  resetUrl: string;
  logoUrl?: string | null;
  logoWidth?: number | null;
}) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 4px;color:${BRAND_BROWN};font-size:20px">Reset Password</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px">Halo <strong>${data.name}</strong>,</p>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">Kami menerima permintaan untuk mengatur ulang password akun Anda di Bee &amp; Flower Brand. Klik tombol di bawah untuk membuat password baru.</p>
    <a href="${data.resetUrl}" style="display:inline-block;padding:12px 28px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px">Atur Password Baru</a>
    <p style="margin-top:24px;color:#aaa;font-size:12px">Link ini berlaku selama <strong style="color:#666">1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini &mdash; akun Anda aman.</p>
    <p style="margin-top:8px;color:#bbb;font-size:11px;word-break:break-all">Atau salin: ${data.resetUrl}</p>
  `, data.logoUrl, data.logoWidth);

  return {
    subject: "Reset Password - Bee & Flower Brand",
    html,
    from: FROM,
  };
}

// --- Welcome Email (new user auto-created on checkout) ---

export function welcomeEmail(data: {
  name: string;
  email: string;
  password: string;
  logoUrl?: string | null;
  logoWidth?: number | null;
}) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 4px;color:${BRAND_BROWN};font-size:20px">Selamat Bergabung!</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px">Halo <strong>${data.name}</strong>, akun Anda di <strong>Bee &amp; Flower Brand</strong> telah berhasil dibuat.</p>
    <div style="background:${BRAND_CREAM};padding:20px 24px;border-radius:8px;margin-bottom:24px">
      <p style="margin:0 0 12px;font-weight:bold;color:${BRAND_BROWN};font-size:14px">Informasi Login Anda:</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#888;font-size:13px;width:100px">Email</td><td style="padding:6px 0;color:${BRAND_BROWN};font-size:13px;font-weight:bold">${data.email}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:13px">Password</td><td style="padding:6px 0;color:${BRAND_BROWN};font-size:16px;font-weight:bold;font-family:monospace;letter-spacing:2px">${data.password}</td></tr>
      </table>
    </div>
    <p style="color:#555;font-size:13px;line-height:1.7;margin:0 0 20px">Simpan password di atas dengan aman. Anda dapat login untuk melihat riwayat pesanan kapan saja.</p>
    <a href="${APP_URL}/login" style="display:inline-block;padding:12px 28px;background:${BRAND_GOLD};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;letter-spacing:1px">MASUK KE AKUN SAYA</a>
    <p style="margin-top:28px;color:#aaa;font-size:12px">Butuh bantuan? Hubungi kami melalui halaman <a href="${APP_URL}/contact" style="color:${BRAND_GOLD}">Kontak</a>.</p>
  `, data.logoUrl, data.logoWidth);
  return { subject: "Selamat Bergabung di Bee & Flower Brand!", html, from: FROM };
}
