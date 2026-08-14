"use client";

import React, {
    useRef,
    useState,
    useCallback,
    useImperativeHandle,
} from "react";
import Icons from "./Icons";

export type InputSize = "sm" | "md" | "lg";

interface InputFileProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
    inputSize?: InputSize;
    label?: string;
    description?: string; // Menambahkan properti label dinamis
}

const sizeClasses: Record<InputSize, string> = {
    sm: "p-4 text-xs rounded-md gap-1.5",
    md: "p-8 text-sm rounded-lg gap-2",
    lg: "p-12 text-base rounded-xl gap-3",
};

const sizeText: Record<InputSize, string> = {
    sm: "text-xs ",
    md: "text-sm ",
    lg: "text-base ",
};

const iconSizeClasses: Record<InputSize, string> = {
    sm: "w-7 h-7 mb-1",
    md: "w-10 h-10 mb-3", // Ukuran standar default
    lg: "w-12 h-12 mb-4",
};

const iconPixelSizes: Record<InputSize, number> = {
    sm: 14, // Ukuran mikro (sangat minimalis, setara dengan teks caption/xs)
    md: 18, // Ukuran standar kecil yang rapi dan elegan
    lg: 24, // Ukuran sedang yang tidak mencolok
};

const roundedClasses: Record<InputSize, string> = {
    sm: "rounded-md", // Kebulatan kecil untuk input sm
    md: "rounded-lg", // Kebulatan standar untuk input md
    lg: "rounded-xl", // Kebulatan modern lembut untuk input lg
};

// Letakkan ini di atas fungsi komponen InputFile Anda
const getStatusClasses = (isDragActive: boolean, hasError: boolean): string => {
    if (isDragActive) {
        return "border-slate-400 bg-white ring-4 ring-slate-500/10";
    }
    if (hasError) {
        return "border-red-400 bg-red-50/10";
    }
    return "border-slate-300 border-dashed bg-slate-50/50";
};

export const InputFile = React.forwardRef<HTMLInputElement, InputFileProps>(
    (
        {
            className = "",
            hasError = false,
            inputSize = "md",
            label = "Logo Provider",
            description = "", // Diterima dari depan dengan nilai default
            name, // Diterima dari depan untuk kebutuhan integrasi form
            onChange,
            ...props
        },
        ref,
    ) => {
        const [file, setFile] = useState<File | null>(null);
        const [isDragActive, setIsDragActive] = useState(false);
        const fileInputRef = useRef<HTMLInputElement>(null);

        // Menyatukan ref eksternal (Hook Form) dengan ref internal komponen untuk input type="file"
        useImperativeHandle(ref, () => fileInputRef.current!, []);
        const statusClasses = getStatusClasses(isDragActive, hasError);

        const handleFileChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                }
                // Meneruskan event ke handler bawaan/form binder jika ada
                if (onChange) {
                    onChange(e);
                }
            },
            [onChange],
        );

        const handleDrag = useCallback((e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "dragenter" || e.type === "dragover") {
                setIsDragActive(true);
            } else if (e.type === "dragleave") {
                setIsDragActive(false);
            }
        }, []);

        const handleDrop = useCallback((e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);

            if (e.dataTransfer.files?.[0]) {
                const droppedFile = e.dataTransfer.files[0];
                setFile(droppedFile);

                // Sinkronisasi file drop ke input DOM asli agar terbaca oleh React Hook Form
                if (fileInputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(droppedFile);
                    fileInputRef.current.files = dataTransfer.files;

                    // Picu event change secara programatik agar diproses form controller
                    const changeEvent = new Event("change", { bubbles: true });
                    fileInputRef.current.dispatchEvent(changeEvent);
                }
            }
        }, []);

        const onButtonClick = useCallback(() => {
            fileInputRef.current?.click();
        }, []);

        const handleRemoveFile = useCallback(() => {
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
                // Picu event change kosong agar status validasi form ikut ter-reset
                const changeEvent = new Event("change", { bubbles: true });
                fileInputRef.current.dispatchEvent(changeEvent);
            }
        }, []);

        // Proteksi properti bertabrakan untuk standard SonarQube bersih
        const { type: _omittedType, ...cleanProps } = props;

        return (
            <div className={`w-full max-w-2xl font-sans ${className}`}>
                <input
                    ref={fileInputRef}
                    type="file"
                    name={name} // Menerapkan properti name dinamis ke input asli
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleFileChange}
                    {...cleanProps}
                />

                {/* KONDISI 1: Berkas Belum Dipilih */}
                {!file ? (
                    <button
                        type="button"
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={onButtonClick}
                        aria-label={`Upload ${label}`}
                        className={`flex flex-col items-center justify-center border text-center transition-all outline-none w-full cursor-pointer ${
                            sizeClasses[inputSize]
                        } ${statusClasses}`}
                    >
                        <div
                            className={`text-slate-400 ${iconSizeClasses[inputSize]}`}
                        >
                            <svg
                                className="w-full h-full"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z"
                                />
                            </svg>
                        </div>

                        <p
                            className={`text-slate-400 max-w-sm leading-relaxed ${sizeText[inputSize]}`}
                        >
                            {description}
                        </p>

                        <p className="font-medium text-slate-500 text-xs">
                            <span className="text-blue-600 font-semibold underline">
                                Klik disini
                            </span>{" "}
                            atau geser file ke sini
                        </p>
                    </button>
                ) : (
                    /* KONDISI 2: Berkas Sudah Dipilih */
                    <div
                        className={`flex items-center justify-between border  bg-slate-50/50 shadow-sm transition-all ${sizeClasses[
                            inputSize
                        ]
                            .replace(/p-\d+/, "p-0")
                            .replace(/gap-[\d.]+/, "")} ${
                            hasError
                                ? "border-red-400 ring-4 ring-red-500/10"
                                : "border-slate-200"
                        }`}
                    >
                        <div className="flex items-center space-x-3 overflow-hidden flex-1 p-2">
                            <div className=" w-5 h-4 flex items-center rounded-sm justify-center bg-blue-50 text-slate-600 shrink-0">
                                <Icons
                                    name="image"
                                    size={iconPixelSizes[inputSize]}
                                    className="text-blue-600"
                                />
                            </div>

                            <span
                                className={` ${sizeText[inputSize]} text-slate-800 truncate underline decoration-slate-300 decoration-1 underline-offset-4`}
                            >
                                {file.name}
                            </span>
                        </div>

                        {/* <div className=" w-5 h-4 flex items-center rounded-sm justify-center bg-blue-50 text-slate-600 shrink-0"> */}
                        <div className="flex items-center space-x-0 text-slate-500 shrink-0 ml-4 ">
                            <button
                                type="button"
                                onClick={onButtonClick}
                                className={`p-1.5 hover:bg-slate-100 hover:text-slate-700${roundedClasses[inputSize]}transition-colors focus:outline-none`}
                                title="Ubah File"
                            >
                                <Icons
                                    name="pencil"
                                    size={iconPixelSizes[inputSize]}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors focus:outline-none"
                                title="Hapus File"
                            >
                                <Icons
                                    name="trash"
                                    size={iconPixelSizes[inputSize]}
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

InputFile.displayName = "InputFile";
