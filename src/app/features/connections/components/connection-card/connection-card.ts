import { Component, computed, inject, input, output } from '@angular/core';
import { Connection } from '../../../../core/models';
import { AuthProfileService } from '../../../../core/services/auth-profile.service';

@Component({
  selector: 'ei-connection-card',
  imports: [],
  templateUrl: './connection-card.html',
})
export class ConnectionCardComponent {
  private readonly auths = inject(AuthProfileService);

  readonly connection = input.required<Connection>();

  readonly edited = output<string>();
  readonly tested = output<string>();
  readonly deleted = output<string>();

  readonly isShared = computed(() => this.connection().tenant === '__shared');
  readonly isSqlServer = computed(() => this.connection().protocol === 'SqlServer');

  readonly icon = computed(() => {
    switch (this.connection().protocol) {
      case 'SqlServer': return '🗄';
      case 'Soap':      return '📜';
      case 'Json':      return '📦';
      default:          return '🔌';
    }
  });

  readonly urlLabel = computed(() =>
    this.isSqlServer() ? 'Server' : 'URL',
  );

  readonly authName = computed(() => {
    const id = this.connection().authProfile;
    if (!id) return '—';
    return this.auths.byId(id)?.name ?? '—';
  });

  /** True when the connection's auth profile stores credentials inline. */
  readonly hasInlineCredentials = computed(() => {
    const id = this.connection().authProfile;
    if (!id) return false;
    const profile = this.auths.byId(id);
    return (
      profile?.type === 'SqlServerConnectionString' &&
      profile?.credentialStorageMode === 'Inline'
    );
  });

  onEdit(): void { this.edited.emit(this.connection().id); }
  onTest(): void { this.tested.emit(this.connection().id); }
  onDelete(): void { this.deleted.emit(this.connection().id); }
}