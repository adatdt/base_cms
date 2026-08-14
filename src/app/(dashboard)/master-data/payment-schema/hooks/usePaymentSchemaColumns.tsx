import { useMemo } from "react";
import { ColumnProps } from "@/components/ui/DataGrid";
import { DropdownBtn } from "@/components/ui/DropdownBtn";
import Icons from "@/components/ui/Icons";
import { Table } from "../interfaces/paymentSchema.interfaces";

// 1. Konfigurasi data statis diletakkan di luar hooks (Efisien Memori)
const RAW_COLUMNS_CONFIG = [
    ["no", "NO", "font-semibold text-slate-800"],
    ["name", "Nama", "font-semibold text-slate-800"],
] as const;

const BASE_COLUMNS: ColumnProps<Table>[] = RAW_COLUMNS_CONFIG.map(
    ([key, header, className]) => ({
        key: key as keyof Table | "actions",
        header,
        className,
    }),
);

interface UsePaymentSchemaProps {
    onEdit: (row: Table) => void;
    onChangeStatus?: (id: string | number) => void;
}

export function usePaymentSchemaColumns({
    onEdit,
    onChangeStatus,
}: Readonly<UsePaymentSchemaProps>) {
    return useMemo<ColumnProps<Table>[]>(
        () => [
            ...BASE_COLUMNS,
            {
                key: "status",
                header: "STATUS",
                className: "text-center w-28",
                render: (row) => {
                    const isStatusActive = String(row.status) === "1";
                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isStatusActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {isStatusActive ? "Aktif" : "Non Aktif"}
                        </span>
                    );
                },
            },
            {
                key: "actions",
                header: "",
                className: "text-right whitespace-nowrap text-xs font-semibold",
                render: (row) => {
                    const statusLabel =
                        String(row.status) === "1"
                            ? "Non Aktifkan"
                            : "Aktifkan";
                    return (
                        <DropdownBtn
                            className="text-slate-400 hover:text-slate-600 active:text-slate-700"
                            variant="ghost"
                            trigger={<Icons name="more-vertical" size={15} />}
                            items={[
                                {
                                    label: "Edit ",
                                    fontWeight: "normal",
                                    fontSize: "xs",
                                    onClick: () => onEdit(row), // Passing row data jika dibutuhkan
                                },
                                {
                                    label: statusLabel,
                                    fontWeight: "normal",
                                    fontSize: "xs",
                                    onClick: () =>
                                        onChangeStatus?.(row.id ?? ""),
                                },
                            ]}
                            widthClass="w-48"
                            alignClass="right-0"
                        />
                    );
                },
            },
        ],
        [onEdit, onChangeStatus], // Re-kalkulasi hanya jika fungsi trigger ini berubah
    );
}
