import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ImageModule } from 'primeng/image';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth-service';

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
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  onLogin() {
    if (!this.username || !this.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, completa todos los campos'
      });
      return;
    }

    this.loading = true;

    const loginData = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/order']);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error en login:', error);

        let errorMessage = 'Error en el login';
        if (error.status === 422) {
          errorMessage = 'Credenciales inválidas';
        } else if (error.status === 401) {
          errorMessage = 'Usuario o contraseña incorrectos';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  onForgotPassword() {
    this.displayRecoverDialog = true;
  }

  onRecoverPassword() {
    // Aquí iría la lógica para enviar el correo de recuperación
    console.log('Correo para recuperación:', this.recoverEmail);
    this.messageService.add({
      severity: 'info',
      summary: 'Recuperación',
      detail: 'Se ha enviado un correo de recuperación'
    });
    this.displayRecoverDialog = false;
    this.recoverEmail = '';
  }

}
