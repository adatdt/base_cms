import postgres from "postgres";

// Daftarkan instance ke globalThis agar TypeScript tidak error saat hot-reload (development)
interface CustomGlobal {
  sqlInstance?: postgres.Sql;
}

declare const globalThis: CustomGlobal;

/**
 * Membaca konfigurasi dari .env.development
 * Dipisah menjadi fungsi kecil agar Cognitive Complexity di SonarQube tetap rendah
 */
function getConnectionString(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.DB_USER || "postgres";
  const pass = process.env.DB_PASSWORD || "";
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = process.env.DB_PORT || "5432";
  const db = process.env.DB_NAME || "asdp_db_dev";

  return `postgres://${user}:${pass}@${host}:${port}/${db}`;
}

/**
 * Menginisialisasi client database tunggal
 */
function createDatabaseClient(): postgres.Sql {
  const connectionString = getConnectionString();
  const options: postgres.Options<{}> = {
    max: 10, // Maksimum kuota pool koneksi
    idle_timeout: 30, // Tutup koneksi otomatis jika idle 30 detik
    connect_timeout: 10, // Batas waktu tunggu koneksi 10 detik
  };

  if (process.env.NODE_ENV === "production") {
    return postgres(connectionString, options);
  }

  // Gunakan global instance untuk environment development
  globalThis.sqlInstance ??= postgres(connectionString, options);

  return globalThis.sqlInstance;
}

// Ekspor instance 'sql' untuk digunakan di seluruh API Next.js
export const sql = createDatabaseClient();
