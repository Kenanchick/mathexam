import { VERIFICATION_CODE_TTL_MINUTES } from "@/lib/auth/verification-code";

export function getVerificationCodeEmail(code: string) {
  return {
    subject: "Код подтверждения MathExam",
    text: [
      `Ваш код подтверждения MathExam: ${code}`,
      `Код действует ${VERIFICATION_CODE_TTL_MINUTES} минут.`,
      "Если вы не регистрировались в MathExam, просто проигнорируйте это письмо.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">Подтверждение email</h1>
        <p style="margin: 0 0 12px;">Ваш код подтверждения MathExam:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 18px 0; color: #2563eb;">
          ${code}
        </div>
        <p style="margin: 0 0 12px;">Код действует ${VERIFICATION_CODE_TTL_MINUTES} минут.</p>
        <p style="margin: 0; color: #6b7280;">Если вы не регистрировались в MathExam, просто проигнорируйте это письмо.</p>
      </div>
    `,
  };
}
