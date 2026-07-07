// types/user.ts
export interface UserQueryResult {
  port_name: string | null;
  group_name: string | null;
  locking: boolean | number;
  id: number | string;
  first_name: string;
  last_name: string | null;
  username: string;
  username_phone: string | null;
  extension_phone: string | null;
  admin_pannel_login: boolean | number;
  validator_login: boolean | number;
  e_ktp_reader_login: boolean | number;
  cs_login: boolean | number;
  pos_login: boolean | number;
  verifier_login: boolean | number;
  command_center_login: boolean | number;
  status: string | number;
}

export interface TableUsers {
  no: number;
  id: string;
  port_name: string | null;
  phone: string | null;
  group_name: string | null;
  first_name: string;
  last_name: string | null;
  username: string;
  username_phone: string | null;
  extension_phone: string | null;
  status: number;
}
