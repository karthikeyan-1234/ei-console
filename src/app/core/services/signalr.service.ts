import { Injectable, signal } from '@angular/core';

/**
 * Placeholder for the live SignalR hub. Today it always reports connected
 * because the fake APIs don't open a WebSocket. When the .NET 10 backend
 * goes live, this class owns the HubConnection lifecycle and flips the
 * `connected` signal from real hub events.
 */
@Injectable({ providedIn: 'root' })
export class SignalrService {
  private readonly _connected = signal(true);
  readonly connected = this._connected.asReadonly();
}