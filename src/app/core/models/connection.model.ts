export type ConnectionProtocol = 'Rest' | 'Soap' | 'Json' | 'SqlServer';

export interface Connection {
  id: string;
  name: string;
  provider: string;
  protocol: ConnectionProtocol;

  /**
   * Interpretation varies by protocol:
   *   Rest | Soap | Json  →  full base URL, e.g. https://api.axa-gulf.ae/v2
   *   SqlServer           →  connection string fragment without credentials,
   *                          e.g. Server=tcp:my.database.windows.net,1433;Database=MyDb;Encrypt=True;
   *
   * The UI renames the field to "Connection String Fragment" for SqlServer.
   * Credentials always live in the referenced auth profile's Key Vault secret.
   */
  baseUrl: string;

  tenant: string;
  authProfile: string;
  status: 'Active' | 'Inactive';
  timeout: number;
  headers: string;
}