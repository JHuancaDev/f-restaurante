import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Sidebar } from "./componets/sidebar/sidebar";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [ConfirmationService, MessageService],
})
export class App {
  protected readonly title = signal('f-restaurante');
}
