import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HttpClientModule,
    ReactiveFormsModule,

    // PrimeNG
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    CommonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [ConfirmationService, MessageService, ConfirmPopupModule],
})
export class App {
  protected readonly title = signal('f-restaurante');
}
