import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthProfileApi, AuthTestResult } from '../auth-profile.api';
import { environment } from '../../../../environments/environment';
import { AuthProfile } from '../../models';

interface AuthProfileDto {
  id: string; name: string; type: string; tenantId: string | null;
  realm?: string | null; audience?: string | null; kcBaseUrl?: string | null;
  clientId?: string | null; secretRef?: string | null; scope?: string | null;
  certRef?: string | null; keyRef?: string | null; caRef?: string | null;
  passRef?: string | null; thumbprint?: string | null;
  credentialStorageMode?: string | null;
  connectionStringSecretRef?: string | null; inlineConnectionString?: string | null;
  username?: string | null;
  ftpPasswordSecretRef?: string | null; ftpInlinePassword?: string | null;
  sftpPrivateKeySecretRef?: string | null; sftpPassphraseSecretRef?: string | null;
  sftpInlinePrivateKey?: string | null; sftpInlinePassphrase?: string | null;
  storedCredentialId?: string | null;

  // ── SubscriptionTokenExchange ────────────────────────────────────
  stTokenEndpoint?: string | null;
  stTokenContentType?: string | null;
  stGrantType?: string | null;
  stSubscriptionKeyMode?: string | null;
  stSubscriptionKeyHeader?: string | null;
  stSubscriptionKeyQueryParam?: string | null;
  stUsernameFieldName?: string | null;
  stPasswordFieldName?: string | null;
  stSecretKeyFieldName?: string | null;
  stPasswordSecretRef?: string | null;
  stInlinePassword?: string | null;
  stSecretKeySecretRef?: string | null;
  stInlineSecretKey?: string | null;
  stSubscriptionKeySecretRef?: string | null;
  stInlineSubscriptionKey?: string | null;
  stSuccessRequiresJsonPath?: string | null;
  stTokenJsonPath?: string | null;
  stTokenPrefix?: string | null;
  stTtlSource?: string | null;
  stExpiresInJsonPath?: string | null;
  stDefaultTtlSeconds?: number | null;
  stAdditionalBodyJson?: string | null;
}
function n(v: string | null | undefined): string | undefined {
  return v == null ? undefined : v;
}

function toAuthProfile(dto: AuthProfileDto): AuthProfile {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type as AuthProfile['type'],
    tenant: dto.tenantId ?? '__shared',
    realm: n(dto.realm),
    audience: n(dto.audience),
    kcBaseUrl: n(dto.kcBaseUrl),
    clientId: n(dto.clientId),
    secretRef: n(dto.secretRef),
    scope: n(dto.scope),
    certRef: n(dto.certRef),
    keyRef: n(dto.keyRef),
    caRef: n(dto.caRef),
    passRef: n(dto.passRef),
    thumbprint: n(dto.thumbprint),
    credentialStorageMode: n(dto.credentialStorageMode) as AuthProfile['credentialStorageMode'],
    connectionStringSecretRef: n(dto.connectionStringSecretRef),
    inlineConnectionString: n(dto.inlineConnectionString),
    username: n(dto.username),
    ftpPasswordSecretRef: n(dto.ftpPasswordSecretRef),
    ftpInlinePassword: n(dto.ftpInlinePassword),
    sftpPrivateKeySecretRef: n(dto.sftpPrivateKeySecretRef),
    sftpPassphraseSecretRef: n(dto.sftpPassphraseSecretRef),
    sftpInlinePrivateKey: n(dto.sftpInlinePrivateKey),
    sftpInlinePassphrase: n(dto.sftpInlinePassphrase),
    storedCredentialId: n(dto.storedCredentialId),
       stTokenEndpoint: dto.stTokenEndpoint ?? undefined,
    stTokenContentType: dto.stTokenContentType ?? undefined,
    stGrantType: dto.stGrantType ?? undefined,
    stSubscriptionKeyMode: dto.stSubscriptionKeyMode ?? undefined,
    stSubscriptionKeyHeader: dto.stSubscriptionKeyHeader ?? undefined,
    stSubscriptionKeyQueryParam: dto.stSubscriptionKeyQueryParam ?? undefined,
    stUsernameFieldName: dto.stUsernameFieldName ?? undefined,
    stPasswordFieldName: dto.stPasswordFieldName ?? undefined,
    stSecretKeyFieldName: dto.stSecretKeyFieldName ?? undefined,
    stPasswordSecretRef: dto.stPasswordSecretRef ?? undefined,
    stInlinePassword: dto.stInlinePassword ?? undefined,
    stSecretKeySecretRef: dto.stSecretKeySecretRef ?? undefined,
    stInlineSecretKey: dto.stInlineSecretKey ?? undefined,
    stSubscriptionKeySecretRef: dto.stSubscriptionKeySecretRef ?? undefined,
    stInlineSubscriptionKey: dto.stInlineSubscriptionKey ?? undefined,
    stSuccessRequiresJsonPath: dto.stSuccessRequiresJsonPath ?? undefined,
    stTokenJsonPath: dto.stTokenJsonPath ?? undefined,
    stTokenPrefix: dto.stTokenPrefix ?? undefined,
    stTtlSource: dto.stTtlSource ?? undefined,
    stExpiresInJsonPath: dto.stExpiresInJsonPath ?? undefined,
    stDefaultTtlSeconds: dto.stDefaultTtlSeconds ?? undefined,
    stAdditionalBodyJson: dto.stAdditionalBodyJson ?? undefined,
  };
}

@Injectable()
export class HttpAuthProfileApi extends AuthProfileApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/auth-profiles`;

  async list(): Promise<AuthProfile[]> {
    const rows = await firstValueFrom(this.http.get<AuthProfileDto[]>(this.base));
    return rows.map(toAuthProfile);
  }
  async get(id: string) {
    const row = await firstValueFrom(this.http.get<AuthProfileDto>(`${this.base}/${id}`));
    return row ? toAuthProfile(row) : undefined;
  }
  async create(input: Omit<AuthProfile, 'id'>) {
    const row = await firstValueFrom(this.http.post<AuthProfileDto>(this.base, input));
    return toAuthProfile(row);
  }
  async update(id: string, patch: Partial<AuthProfile>) {
    const row = await firstValueFrom(this.http.put<AuthProfileDto>(`${this.base}/${id}`, patch));
    return toAuthProfile(row);
  }
  async remove(id: string) {
    await firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
  test(id: string) {
    return firstValueFrom(this.http.post<AuthTestResult>(`${this.base}/${id}/test`, {}));
  }
}