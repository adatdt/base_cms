import React from "react";
import Modal from "./Modal"; // Sesuaikan path ke komponen Modal Anda
import SidePanel, { type PanelSize } from "./SidePanel";

// 1. Definisikan tipe data untuk objek modal tunggal
export interface ModalConfig {
    id: string;
    title: string;
    renderContent: (id: string) => React.ReactNode;
}

// 2. Definisikan props: sekarang menerima array 'configs'
interface ModalListRendererProps {
    configs: ModalConfig[];
    isLoading: boolean;
    sizeSlidePanel?: PanelSize;
    sizeModal?: PanelSize;
}

/**
 * ModalListRenderer Component
 * Menangani seluruh perulangan map secara internal
 */
export const ModalListRenderer: React.FC<ModalListRendererProps> = ({
    configs,
    isLoading,
    sizeSlidePanel = "3xl",
    sizeModal = "3xl",
}) => {
    return (
        <>
            {configs.map((modal) => {
                // Tentukan wrapper secara dinamis untuk setiap item
                let ComponentWrapper = SidePanel;
                let size = sizeSlidePanel;
                if (modal.id === "Form Aktif") {
                    ComponentWrapper = Modal;
                    size = sizeModal;
                }

                return (
                    <ComponentWrapper
                        key={modal.id} // Atribut key wajib ada di elemen terluar dalam map
                        id={modal.id}
                        title={modal.title}
                        size={size === "dynamic" ? "3xl" : size}
                        isBackdropLoading={isLoading}
                    >
                        {modal.renderContent(modal.id)}
                    </ComponentWrapper>
                );
            })}
        </>
    );
};
