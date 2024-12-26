import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.reducer';
import { Usuario } from '../../models/usuario.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);

  user = signal<Usuario>({} as Usuario);
  userSubs?: Subscription;

  ngOnInit(): void {
    this.userSubs = this.store.select('user').subscribe(({ user }) => {
      this.user.set({ ...user });
    });
  }

  ngOnDestroy(): void {
    this.userSubs?.unsubscribe();
  }
}
