export interface Tenant {
  id: string;
  code: string;
  name: string;
  coreUrl: string;
  coreDbRef?: string;
  active: boolean;
}