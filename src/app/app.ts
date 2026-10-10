import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './shared/components/toast-host/toast-host';
import { JsonOverlayComponent } from './shared/components/json-overlay/json-overlay';
import { ChatBotComponent } from './features/chat/chat-bot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, JsonOverlayComponent, ChatBotComponent],
  templateUrl: './app.html',
})
export class AppComponent {}