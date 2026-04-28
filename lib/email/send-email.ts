import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = {
  devFallback: boolean;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const isProduction = process.env.NODE_ENV === "production";
  const isDevFallbackEnabled =
    process.env.EMAIL_DEV_FALLBACK === "true" && !isProduction;

  if (!apiKey || !from) {
    if (isDevFallbackEnabled) {
      console.log("DEV_EMAIL_FALLBACK", {
        to,
        subject,
        text,
      });

      return {
        devFallback: true,
      };
    }
  }

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  if (!from) {
    throw new Error("EMAIL_FROM is not set");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return {
    devFallback: false,
  };
}
