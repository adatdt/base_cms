export interface ColumnProps {
    onEdit: (row: Record<string, any>) => void; // Menggunakan Record jika data row berbentuk objek dinamis
    onChangeStatus?: (
        id: string | number,
        status: string | number,
        dataName: string,
    ) => void;
}
