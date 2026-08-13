// Interface untuk objek paginasi yang ada di dalam properti 'data'
export interface PaginatedData<T> {
    recordsFiltered: number;
    recordsTotal: string | number;
    pageTotal: number;
    currentPage: number;
    hasPrev: boolean;
    hasNext: boolean;
    start: number;
    records: T[];
}

// Interface utama untuk format Response API Global
export interface ApiTableResponse<T> {
    status: boolean;
    code: number;
    reqId: string;
    message: string;
    data: PaginatedData<T>;
    error: string | object | null;
    srvId: string | null;
}
