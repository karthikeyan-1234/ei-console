import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StoredCredentialApi } from '../stored-credential.api';
import { StoredCredential } from '../../models';
import { environment } from '../../../../environments/environment';
@Injectable()
export class HttpStoredCredentialApi extends StoredCredentialApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/stored-credentials`;

  list() { return firstValueFrom(this.http.get<StoredCredential[]>(this.base)); }
  get(id: string) { return firstValueFrom(this.http.get<StoredCredential | undefined>(`${this.base}/${id}`)); }
  create(input: Omit<StoredCredential, 'id'>) {
    return firstValueFrom(this.http.post<StoredCredential>(this.base, input));
  }
  update(id: string, patch: Partial<StoredCredential>) {
    return firstValueFrom(this.http.patch<StoredCredential>(`${this.base}/${id}`, patch));
  }
  remove(id: string) {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}