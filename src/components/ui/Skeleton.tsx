import React, { useMemo } from "react";

type SkeletonAlign = "left" | "center" | "right";
type SkeletonRows = 1 | 2 | 3 | 4 | 5;
type SkeletonVariant = "all" | "skeleton-only" | "text-only";

interface SkeletonItemProps {
  id: string;
  align: SkeletonAlign;
  rows: SkeletonRows;
}

// Sub-komponen untuk satu grup item skeleton
const SkeletonItem: React.FC<SkeletonItemProps> = ({ id, align, rows }) => {
  const alignClasses = {
    left: "items-start",
    center: "items-center",
    right: "items-end",
  };

  const rowStyles = [
    { width: "w-full", maxW: "max-w-[95%]" },
    { width: "w-full", maxW: "max-w-[85%]" },
    { width: "w-full", maxW: "max-w-[50%]" },
    { width: "w-full", maxW: "max-w-[66%]" },
    { width: "w-full", maxW: "max-w-[33%]" },
  ];

  const rowsArray = Array.from({ length: rows }, (_, index) => ({
    rowId: `${id}-row-${index + 1}`,
    style: rowStyles[index],
    isLast: index === rows - 1,
  }));

  return (
    <div
      className={`animate-pulse flex flex-col w-full py-1 ${alignClasses[align]}`}
    >
      {rowsArray.map(({ rowId, style, isLast }) => (
        <div
          key={rowId}
          className={`h-4 bg-gray-300 rounded ${style.width} ${style.maxW} ${!isLast ? "mb-1" : ""}`}
        />
      ))}
    </div>
  );
};

interface MenuSkeletonProps {
  totalCount?: number;
  align?: SkeletonAlign;
  rows?: SkeletonRows;
  variant?: SkeletonVariant; // 🌟 Optional new property for display options
}

interface SkeletonObject {
  id: string;
}

// Komponen Utama
const Skeleton: React.FC<MenuSkeletonProps> = ({
  totalCount = 7,
  align = "left",
  rows = 3,
  variant = "all", // 🌟 Default value displays both text and block lines
}) => {
  const skeletonItems = useMemo<SkeletonObject[]>(() => {
    return Array.from({ length: totalCount }, (_, index: number) => ({
      id: `sk-${index + 1}`,
    }));
  }, [totalCount]);

  // Determine visibility states cleanly to prevent SonarQube flags
  const showText = variant === "all" || variant === "text-only";
  const showSkeleton = variant === "all" || variant === "skeleton-only";

  return (
    <div className="menu-skeleton-list flex flex-col justify-start p-6 w-full">
      {/* 🌟 1. TEXT LOADING NODE */}
      {showText && (
        <div className="w-full flex flex-col items-center justify-center p-4 mb-4 select-none animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Loading data...
            </span>
          </div>
        </div>
      )}

      {/* 🌟 2. SKELETON BLOCKS NODE */}
      {showSkeleton &&
        skeletonItems.map((item) => (
          <SkeletonItem key={item.id} id={item.id} align={align} rows={rows} />
        ))}
    </div>
  );
};

export default Skeleton;
