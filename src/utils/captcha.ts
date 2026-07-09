import { encryptData, decryptData } from "@/utils/crypto";

export interface CaptchaQuestion {
  text: string; // Contoh: "A b 3 T X" (Diberi spasi agar estetika renggang mudah dibaca)
  encryptedAnswer: string; // Jawaban asli padat "Ab3TX" yang sudah dienkripsi AES
}

/**
 * Men-generate string alfanumerik acak secara aman (CSPRNG) untuk Captcha
 */
export const generateTextCaptcha = (): CaptchaQuestion => {
  // Daftar karakter yang mudah dibaca (menghilangkan angka 0, o, 1, dan l agar user tidak bingung)
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const length = 5; // Panjang karakter captcha

  // Membuat nilai acak yang aman dari SonarQube (CSPRNG)
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let resultAnswer = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % characters.length;
    resultAnswer += characters.charAt(randomIndex);
  }

  // Pisahkan teks dengan spasi di UI agar bot OCR sulit membaca, tetapi user mudah melihat
  const textRepresentation = resultAnswer.split("").join(" ");

  // Enkripsi jawaban asli (padat tanpa spasi) menggunakan AES utilitas kita
  const encryptedAnswer = encryptData(resultAnswer);

  return { text: textRepresentation, encryptedAnswer };
};

/**
 * Memvalidasi apakah input jawaban user cocok dengan jawaban terenkripsi asli
 */
export const verifyTextCaptcha = (
  userInput: string,
  encryptedAnswer: string,
): boolean => {
  if (!userInput || !encryptedAnswer) return false;

  const decrypted = decryptData(encryptedAnswer);

  // Gunakan .toLowerCase() atau .toUpperCase() jika ingin validasi bersifat case-insensitive (tidak sensitif huruf besar/kecil)
  return userInput.trim().toLowerCase() === decrypted.trim().toLowerCase();
};
