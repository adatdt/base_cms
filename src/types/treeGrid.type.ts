export interface TreeGridRow {
  id: string | number;
  parentId: string | number | null;
  level?: number;
  isLeaf: boolean;
  [key: string]: any;
}

export interface TreeGridColumn<T> {
  key: keyof T | "actions";
  header: string;
  className?: string;
  isTreeField?: boolean;
  // Tambahkan fitur render kustom agar aksi bisa dioper dari file Page
  render?: (row: T) => React.ReactNode;
}
