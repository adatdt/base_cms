import React from "react";
import Modal from "../ui/Modal"; // Sesuaikan path ke komponen Modal Anda
import SidePanel, { type PanelSize } from "../ui/SidePanel";

// 1. Definisikan tipe data untuk objek modal tunggal
export interface ModalConfig {
    id: string;
    title: string;
    renderContent: (id: string) => React.ReactNode;
    variant?: "sidePanel" | "modal" | (string & {});
    sizePanel?: PanelSize;
    modalConfigurations?: true;
    showFooter?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
}

// 2. Definisikan props: sekarang menerima array 'configs'
interface ModalListRendererProps {
    configs: ModalConfig[];
    isLoading: boolean;
}

/**
 * ModalListRenderer Component
 * Menangani seluruh perulangan map secara internal
 */
export const ModalListRenderer: React.FC<ModalListRendererProps> = ({
    configs,
    isLoading,
}) => {
    return (
        <>
            {configs.map((modal) => {
                // 💡 Ambil variant dengan nilai default "sidePanel" jika modal.variant bernilai falsy (undefined/null/"")
                const activeVariant = modal.variant || "sidePanel";

                // Tentukan wrapper secara dinamis untuk setiap item berdasarkan activeVariant
                let ComponentWrapper = SidePanel;
                if (activeVariant === "modal") {
                    ComponentWrapper = Modal;
                }

                let size = modal.sizePanel ?? "2xl";

                return (
                    <ComponentWrapper
                        key={modal.id} // Atribut key wajib ada di elemen terluar dalam map
                        id={modal.id}
                        title={modal.title}
                        size={size === "dynamic" ? "3xl" : size}
                        isBackdropLoading={isLoading}
                        showFooter={modal.showFooter}
                        onConfirm={modal.onConfirm}
                        confirmText={modal.confirmText || `Simpan`}
                    >
                        {modal.renderContent(modal.id)}
                    </ComponentWrapper>
                );
            })}
        </>
    );
};
