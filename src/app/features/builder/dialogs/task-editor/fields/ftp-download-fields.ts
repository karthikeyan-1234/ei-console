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

  /** Service-backed, safe as computed. */
  readonly connectionOptions = computed(() =>
    this.connections.scopedConnections().filter(c =>
      c.protocol === 'Ftp' || c.protocol === 'Sftp'),
  );

  readonly authOptions = this.auths.scopedProfiles;

  // Methods — task is mutated in place.

  remotePath(): string { return this.task().remotePath ?? ''; }
  fileFormat(): string { return this.task().fileFormat ?? 'Auto'; }
  deleteAfterDownload(): boolean { return this.task().deleteAfterDownload ?? false; }
  outputKey(): string { return this.task().outputKey ?? 'FileContent'; }

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