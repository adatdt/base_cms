import { create } from "zustand";
import type { NotificationType } from "@/components/ui/Notification";

export interface ToastItem {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationState {
  toastList: ToastItem[];
  triggerNotification: (
    msg: string,
    type: NotificationType,
    duration?: number,
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

  triggerNotification: (msg, type, duration) => {
    const id = crypto.randomUUID();

    set((state) => ({
      toastList: [...state.toastList, { id, message: msg, type, duration }],
    }));
  },
}));
