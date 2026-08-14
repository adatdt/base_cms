import { create } from "zustand";
import type {
    NotificationType,
    NotificationPosition,
    NotificationWidth,
} from "@/components/ui/Notification";

export interface ToastItem {
    id: string;
    message: string;
    type: NotificationType;
    position: NotificationPosition;
    width: NotificationWidth;
    hasLeftBorder: boolean;
    duration?: number;
}

interface NotificationState {
    toastList: ToastItem[];
    triggerNotification: (
        msg: string,
        type: NotificationType,
        position?: NotificationPosition,
        width?: NotificationWidth,
        hasLeftBorder?: boolean,
        duration?: number, // Parameter opsional ditaruh di akhir
    ) => void;
    handleClose: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    toastList: [],

    handleClose: (id) => {
        set((state) => ({
            toastList: state.toastList.filter((toast) => toast.id !== id),
        }));
    },

    // PERBAIKAN: Semua parameter bermasalah dengan nilai default diletakkan berurutan di bagian akhir
    triggerNotification: (
        msg,
        type,
        position = "top-center",
        width = "sm",
        hasLeftBorder = false,
        duration = 3000,
    ) => {
        const id = crypto.randomUUID();

        set((state) => ({
            toastList: [
                ...state.toastList,
                {
                    id,
                    message: msg,
                    type,
                    position,
                    width,
                    hasLeftBorder,
                    duration,
                },
            ],
        }));
    },
}));
