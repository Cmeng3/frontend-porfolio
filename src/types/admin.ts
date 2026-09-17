export type RecordData = Record<string, unknown> & { id: number };
export interface FieldSpec {
  type: string;
  required: boolean;
  options?: string[];
  reference?: string;
  relation?: string;
  default?: string | number | boolean;
}
export interface Definition {
  model: string;
  table: string;
  fields: Record<string, FieldSpec>;
  relations: string[];
}
export type Schema = Record<string, Definition>;
export interface AdminPage {
  data: RecordData[];
  meta: { current_page: number; last_page: number; total: number };
}
