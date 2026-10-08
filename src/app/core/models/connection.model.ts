export type ConnectionProtocol = 'Rest' | 'Soap' | 'Json' | 'SqlServer' | 'Ftp' | 'Sftp';

export interface Connection {
  id: string;
  name: string;
  provider: string;
  protocol: ConnectionProtocol;

  /**
   * Interpretation varies by protocol:
   *   Rest | Soap | Json  →  full base URL, e.g. https://api.axa-gulf.ae/v2
   *   SqlServer           →  connection string fragment without credentials
   *   Ftp | Sftp          →  hostname only, e.g. ftp.insureliv-internal.com
   *                          (the port lives in its own field)
   */
  baseUrl: string;

  /**
   * Ftp | Sftp only. Defaults to 21 (Ftp) or 22 (Sftp) when not set.
   * Ignored by every other protocol.
   */
  port?: number;

  tenant: string;
  authProfile: string;
  status: 'Active' | 'Inactive';
  timeout: number;
  headers: string;
}