export interface ApiFetchResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    total_data?: number;
}