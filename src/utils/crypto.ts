import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.CRYPTO_SECRET_KEY || "bawaan-kunci-rahasia-super-aman-2026";

/**
 * Encrypts plain text into a URL-Safe string (No +, /, or = characters)
 */
export const encryptData = (text: string): string => {
  if (!text) return "";
  try {
    const rawCipher = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

    // 🌟 SonarQube-Safe conversion: Replace + and / using non-vulnerable string tokens
    const urlSafeBase64 = rawCipher.replaceAll("+", "-").replaceAll("/", "_");

    // 🌟 FIX FOR SONARQUBE: Safe procedural removal of trailing '=' instead of a backtracking regex
    let endIndex = urlSafeBase64.length;
    while (endIndex > 0 && urlSafeBase64.charAt(endIndex - 1) === "=") {
      endIndex--;
    }

    return urlSafeBase64.slice(0, endIndex);
  } catch (error) {
    console.error("Gagal melakukan enkripsi data:", error);
    return "";
  }
};

/**
 * Decrypts a URL-Safe string back into its original text representation
 */
export const decryptData = (cipherText: string): string => {
  if (!cipherText) return "";
  try {
    // Restore base characters
    let base64 = cipherText.replaceAll("-", "+").replaceAll("_", "/");

    // Safe procedural padding recalculation matching kelipatan 4 bytes boundary
    const remainder = base64.length % 4;
    if (remainder > 0) {
      base64 += "====".slice(remainder);
    }

    const bytes = CryptoJS.AES.decrypt(base64, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalText) {
      throw new Error("Hasil dekripsi kosong atau kunci rahasia salah.");
    }

    return originalText;
  } catch (error) {
    console.error("Gagal melakukan dekripsi data:", error);
    return "";
  }
};
