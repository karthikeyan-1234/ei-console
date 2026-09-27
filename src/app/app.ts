import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './shared/components/toast-host/toast-host';
import { JsonOverlayComponent } from './shared/components/json-overlay/json-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, JsonOverlayComponent],
  templateUrl: './app.html',
})
export class AppComponent {}