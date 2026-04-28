import { sendEmail } from "@/lib/email/send-email";
import { getVerificationCodeEmail } from "@/lib/email/templates/verification-code";

type SendVerificationCodeInput = {
  to: string;
  code: string;
};

export async function sendVerificationCode({
  to,
  code,
}: SendVerificationCodeInput) {
  return sendEmail({
    to,
    ...getVerificationCodeEmail(code),
  });
}
