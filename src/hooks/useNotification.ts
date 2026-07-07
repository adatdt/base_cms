import { useState, useCallback } from "react";
import type { NotificationType } from "@/components/ui/Notification"; // Sesuaikan path komponen Anda

export function useNotification() {
  const [toast, setToast] = useState<{
    message: string | null;
    type: NotificationType;
  }>({
    message: null,
    type: "default",
  });

  // Menggunakan useCallback agar fungsi tidak dibuat ulang setiap render (Lebih Hemat Memori)
  const triggerNotification = useCallback(
    (msg: string, type: NotificationType) => {
      setToast({ message: msg, type });
    },
    [],
  );

  const handleClose = useCallback(() => {
    setToast((prev) => ({ ...prev, message: null }));
  }, []);

  return {
    toast,
    triggerNotification,
    handleClose,
  };
}
