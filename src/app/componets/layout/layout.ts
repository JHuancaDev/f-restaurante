import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { RouterModule } from "@angular/router";
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-layout',
  imports: [Sidebar, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
 constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
