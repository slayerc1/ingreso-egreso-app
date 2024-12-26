import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.reducer';
import { Usuario } from '../../models/usuario.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: ``,
})
export class SidebarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store<AppState>);

  user = signal<Usuario>({} as Usuario);
  userSubs?: Subscription;

  ngOnInit(): void {
    this.store.select('user').subscribe(({ user }) => {
      this.user.set({ ...user });
    });
  }

  ngOnDestroy(): void {
    this.userSubs?.unsubscribe();
  }

  logout(): void {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
