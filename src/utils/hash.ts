import bcrypt from "bcryptjs";

// Faktor kekuatan salt (work factor). Angka 10 adalah standar industri yang ideal dan seimbang.
const SALT_ROUNDS = 10;

/**
 * Mengubah data teks biasa menjadi string hash acak yang aman untuk disimpan di database
 * @param rawData Data teks biasa (seperti password, PIN, dll) yang ingin diamankan
 * @returns String hash aman hasil enkripsi Bcrypt
 */
export const generateHash = async (rawData: string): Promise<string> => {
  // Pengecekan kondisi IF untuk memastikan input tidak kosong atau hanya berisi spasi
  if (!rawData || rawData.trim().length === 0) {
    return "";
  }

  try {
    // Generate salt acak terlebih dahulu
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // Masukkan data bersama salt ke fungsi hash
    return await bcrypt.hash(rawData, salt);
  } catch (error) {
    console.error("Gagal melakukan enkripsi data hash:", error);
    return "";
  }
};

/**
 * Memverifikasi kesesuaian antara data teks biasa dengan hash yang tersimpan di database
 * @param rawData Data teks biasa dari input form (input login/validasi)
 * @param hashedData String hash asli yang diambil dari database
 * @returns Boolean true jika cocok, false jika salah
 */
export const verifyHash = async (
  rawData: string,
  hashedData: string,
): Promise<boolean> => {
  // Validasi ketat untuk mencegah serangan null pointer exception
  if (
    !rawData ||
    !hashedData ||
    rawData.trim().length === 0 ||
    hashedData.trim().length === 0
  ) {
    return false;
  }

  try {
    return await bcrypt.compare(rawData, hashedData);
  } catch (error) {
    console.error("Gagal melakukan verifikasi komparasi data hash:", error);
    return false;
  }
};
