"use server";

import { generateTextCaptcha, CaptchaQuestion } from "@/utils/captcha";

/**
 * Server action mandiri untuk men-generate soal captcha baru
 */
export async function getNewCaptcha(): Promise<CaptchaQuestion> {
  return generateTextCaptcha();
}
