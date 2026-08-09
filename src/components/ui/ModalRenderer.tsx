import React from 'react';
import Modal from './Modal';       // Sesuaikan path ke komponen Modal Anda
import SidePanel from './SidePanel'; // Sesuaikan path ke komponen SidePanel Anda

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
}

/**
 * ModalListRenderer Component
 * Menangani seluruh perulangan map secara internal
 */
export const ModalListRenderer: React.FC<ModalListRendererProps> = ({ configs, isLoading }) => {
  return (
    <>
      {configs.map((modal) => {
        // Tentukan wrapper secara dinamis untuk setiap item
        const ComponentWrapper = modal.id === 'Form Aktif' ? Modal : SidePanel;

        return (
          <ComponentWrapper
            key={modal.id} // Atribut key wajib ada di elemen terluar dalam map
            id={modal.id}
            title={modal.title}
            size="3xl"
            isBackdropLoading={isLoading}
          >
            {modal.renderContent(modal.id)}
          </ComponentWrapper>
        );
      })}
    </>
  );
};
