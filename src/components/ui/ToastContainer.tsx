"use client";

import { useNotificationStore } from "@/store/useNotificationStore";
import Notification, {
    NotificationPosition,
} from "@/components/ui/Notification";

export default function ToastContainer() {
    const toastList = useNotificationStore((state) => state.toastList);
    const handleClose = useNotificationStore((state) => state.handleClose);

    const positions: NotificationPosition[] = [
        "top-center",
        "top-right",
        "top-left",
        "bottom-center",
        "bottom-right",
        "bottom-left",
    ];

    // 1. Set tumpukan dasar kontainer: flex-col (atas ke bawah) & flex-col-reverse (bawah ke atas)
    // Serta pasang items-start/end/center agar lebar dinamis item tidak dipaksa melebar penuh (stretch)
    const containerStyles: Record<NotificationPosition, string> = {
        "top-center": "top-5 left-1/2 -translate-x-1/2 flex-col items-center",
        "top-right": "top-5 right-5 flex-col items-end",
        "top-left": "top-5 left-5 flex-col items-start",
        "bottom-center":
            "bottom-5 left-1/2 -translate-x-1/2 flex-col-reverse items-center",
        "bottom-right": "bottom-5 right-5 flex-col-reverse items-end",
        "bottom-left": "bottom-5 left-5 flex-col-reverse items-start",
    };

    // 2. Pemetaan kelas lebar Tailwind terpusat di sini agar tidak bentrok dengan komponen anak
    const widthStyles = {
        sm: "w-full max-w-sm", // 384px
        md: "w-full max-w-md", // 448px
        lg: "w-full max-w-lg", // 512px
        xl: "w-full max-w-xl", // 576px
        full: "w-full max-w-full",
    };

    return (
        <>
            {positions.map((pos) => {
                const toastsInPosition = toastList.filter(
                    (t) => t.position === pos,
                );
                if (toastsInPosition.length === 0) return null;

                return (
                    <div
                        key={pos}
                        // Hapus batasan max-w statis di kontainer fixed luar agar membebaskan ruang untuk flex item
                        className={`fixed z-50 flex gap-2 w-full p-4 pointer-events-none ${containerStyles[pos]}`}
                    >
                        {toastsInPosition.map((toast) => (
                            <div
                                key={toast.id}
                                // 3. Bungkus item dengan pointer-events-auto dan atur lebar dinamisnya di sini
                                // Nilai fallback 'sm' dipasang jika properti width dari store bernilai undefined
                                className={`pointer-events-auto transition-all duration-300 ${
                                    widthStyles[toast.width || "sm"]
                                }`}
                            >
                                <Notification
                                    message={toast.message}
                                    type={toast.type}
                                    duration={toast.duration}
                                    position={toast.position}
                                    onClose={() => handleClose(toast.id)}
                                />
                            </div>
                        ))}
                    </div>
                );
            })}
        </>
    );
}
