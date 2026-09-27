export type ConnectionProtocol = 'Rest' | 'Soap' | 'Json';

export interface Connection {
  id: string;
  name: string;
  provider: string;
  protocol: ConnectionProtocol;
  baseUrl: string;
  tenant: string;
  authProfile: string;
  status: 'Active' | 'Inactive';
  timeout: number;
  headers: string;
}