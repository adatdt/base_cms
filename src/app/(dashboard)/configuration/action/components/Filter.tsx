import React from "react";
import { DropdownBtn } from "@/components/ui/DropdownBtn";
import Icons from "@/components/ui/Icons";
import Btn from "@/components/ui/Btn";
import { InputText } from "@/components/ui/InputText";

interface GroupFilterProps {
    // 🌟 PROP BARU: Menerima nilai string dinamis dari state luar/depan
    searchValue: string;
    onSearchChange?: (value: string) => void;
    onApply?: () => void;
    onReset?: () => void;
    isLoading?: boolean;
}

export default function Filter({
    searchValue, // 🌟 Ambil prop searchValue di sini
    onSearchChange,
    onApply,
    onReset,
    isLoading = false,
}: Readonly<GroupFilterProps>) {
    return (
        <DropdownBtn
            size="md"
            variant="default"
            header="Filter"
            className="text-slate-400 hover:text-slate-600"
            trigger={
                <>
                    Filter
                    <Icons name="filter" size={15} />
                </>
            }
            footer={
                <div className="border-t border-gray-200 p-4 bg-slate-10 flex justify-center gap-2 shrink-0 w-full">
                    <Btn
                        type="button"
                        variant="default"
                        size="md"
                        fullWidth={true}
                        onClick={onReset}
                    >
                        Kembali
                    </Btn>
                    <Btn
                        fullWidth={true}
                        isLoading={isLoading}
                        type="button"
                        variant="info"
                        size="md"
                        onClick={onApply}
                    >
                        <span className="whitespace-nowrap block">
                            Terapkan
                        </span>
                    </Btn>
                </div>
            }
            items={[
                {
                    closeOnItemClick: false,
                    className: "hover:bg-transparent",
                    label: (
                        <div className="flex flex-col gap-1 w-full">
                            <label
                                htmlFor="quick_search"
                                className="text-xs font-semibold text-slate-500"
                            >
                                Cari
                            </label>

                            <InputText
                                type={"text"}
                                inputSize={"sm"}
                                value={searchValue || ""}
                                onChange={(e) =>
                                    onSearchChange?.(e.target.value)
                                }
                                name="quick_search"
                                placeholder="Cari..."
                            />
                        </div>
                    ),
                },
            ]}
            widthClass="w-md"
            alignClass="right-0"
        />
    );
}
