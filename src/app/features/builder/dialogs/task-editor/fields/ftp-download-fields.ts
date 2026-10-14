import { Component, computed, inject, input } from '@angular/core';
import { FtpDownloadTask } from '../../../../../core/models/pipeline-task.model';
import { ConnectionService } from '../../../../../core/services/connection.service';
import { AuthProfileService } from '../../../../../core/services/auth-profile.service';

@Component({
  selector: 'ei-ftp-download-fields',
  imports: [],
  templateUrl: './ftp-download-fields.html',
})
export class FtpDownloadFieldsComponent {
  private readonly connections = inject(ConnectionService);
  private readonly auths = inject(AuthProfileService);

  readonly task = input.required<FtpDownloadTask>();

  /** Only FTP and SFTP connections are selectable. */
  readonly connectionOptions = computed(() =>
    this.connections.scopedConnections().filter(c =>
      c.protocol === 'Ftp' || c.protocol === 'Sftp'),
  );

  readonly authOptions = this.auths.scopedProfiles;

  readonly remotePath = computed(() => this.task().remotePath ?? '');
  readonly fileFormat = computed(() => this.task().fileFormat ?? 'Auto');
  readonly deleteAfterDownload = computed(() => this.task().deleteAfterDownload ?? false);
  readonly outputKey = computed(() => this.task().outputKey ?? 'FileContent');

  onConnectionChange(v: string): void { this.task().connectionId = v; }
  onAuthChange(v: string): void { this.task().authId = v || undefined; }
  onRemotePathChange(v: string): void { this.task().remotePath = v; }
  onFileFormatChange(v: string): void {
    this.task().fileFormat = v as FtpDownloadTask['fileFormat'];
  }
  onDeleteAfterDownloadChange(v: boolean): void {
    this.task().deleteAfterDownload = v;
  }
  onOutputKeyChange(v: string): void { this.task().outputKey = v; }
}