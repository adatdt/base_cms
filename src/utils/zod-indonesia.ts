import { z } from "zod";

const PESAN_ERROR = {
    required: "Kolom ini wajib diisi.",
    invalidType: "Format data tidak valid. Diharapkan {expected}.",
    email: "Format alamat email tidak valid.",
    url: "Format tautan (URL) tidak valid.",
    uuid: "Format ID unik (UUID) tidak valid.",
    invalidFormat: "Format teks tidak sesuai ketentuan.",
    tooSmall: "Nilai yang dimasukkan terlalu kecil.",
    tooBig: "Nilai yang dimasukkan terlalu besar.",
    custom: "Validasi data gagal.",
    invalidValue: "Pilihan yang Anda masukkan tidak terdaftar dalam sistem.",
    unrecognizedKeys: "Kolom data tidak dikenali: {keys}.",
} as const;

const FORMAT_MESSAGES: Record<string, string> = {
    email: PESAN_ERROR.email,
    url: PESAN_ERROR.url,
    uuid: PESAN_ERROR.uuid,
};

function getSizeMessage(
    origin: string,
    value: number | bigint,
    type: "small" | "big",
): string {
    const valueText = String(value);

    if (type === "small") {
        if (origin === "string") {
            return `Minimal harus terdiri dari ${valueText} karakter.`;
        }

        if (origin === "number" || origin === "bigint") {
            return `Nilai minimal yang diperbolehkan adalah ${valueText}.`;
        }

        if (origin === "array") {
            return `Minimal harus memilih ${valueText} item.`;
        }

        return PESAN_ERROR.tooSmall;
    }

    if (origin === "string") {
        return `Maksimal hanya diperbolehkan ${valueText} karakter.`;
    }

    if (origin === "number" || origin === "bigint") {
        return `Nilai maksimal yang diperbolehkan adalah ${valueText}.`;
    }

    if (origin === "array") {
        return `Maksimal hanya diperbolehkan memilih ${valueText} item.`;
    }

    return PESAN_ERROR.tooBig;
}

export function inisialisasiZodBahasaIndonesia(): void {
    z.config({
        customError: (issue) => {
            if (issue.code === "invalid_type") {
                if (issue.input == null) {
                    return PESAN_ERROR.required;
                }

                return PESAN_ERROR.invalidType.replace(
                    "{expected}",
                    issue.expected,
                );
            }

            if (issue.code === "invalid_format") {
                return (
                    FORMAT_MESSAGES[issue.format] ?? PESAN_ERROR.invalidFormat
                );
            }

            if (issue.code === "too_small") {
                return getSizeMessage(issue.origin, issue.minimum, "small");
            }

            if (issue.code === "too_big") {
                return getSizeMessage(issue.origin, issue.maximum, "big");
            }

            if (issue.code === "custom") {
                return issue.message || PESAN_ERROR.custom;
            }

            if (issue.code === "invalid_value") {
                return PESAN_ERROR.invalidValue;
            }

            if (issue.code === "unrecognized_keys") {
                return PESAN_ERROR.unrecognizedKeys.replace(
                    "{keys}",
                    issue.keys.join(", "),
                );
            }

            return undefined;
        },
    });
}
