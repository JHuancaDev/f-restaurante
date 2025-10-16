import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { Image } from 'primeng/image';
import { ImageModule } from 'primeng/image';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    DialogModule,
    ToastModule,
    ImageModule,
    RouterModule
],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username: string = '';
  password: string = '';
  recoverEmail: string = '';
  displayRecoverDialog: boolean = false;

  onLogin() {
    // Aquí iría la lógica para autenticar al usuario
    console.log('Usuario:', this.username);
    console.log('Contraseña:', this.password);
  }

  onForgotPassword() {
    this.displayRecoverDialog = true;
  }

  onRecoverPassword() {
    // Aquí iría la lógica para enviar el correo de recuperación
    console.log('Correo para recuperación:', this.recoverEmail);
    this.displayRecoverDialog = false;
  }
}
