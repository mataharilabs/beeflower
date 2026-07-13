import Xendit from "xendit-node";

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY ?? "",
});

export const xendit = xenditClient;
export const { Invoice } = xenditClient;

export async function createXenditInvoice(params: {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}) {
  const invoice = await Invoice.createInvoice({
    data: {
      externalId: params.externalId,
      amount: params.amount,
      payerEmail: params.payerEmail,
      description: params.description,
      successRedirectUrl: params.successRedirectUrl,
      failureRedirectUrl: params.failureRedirectUrl,
      currency: "IDR",
    },
  });
  return invoice;
}

export function verifyXenditWebhook(
  token: string,
  webhookToken: string
): boolean {
  return token === webhookToken;
}
