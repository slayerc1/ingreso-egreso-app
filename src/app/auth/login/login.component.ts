import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import * as ui from '../../shared/ui.actions';

import { AppState } from '../../app.reducer';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store<AppState>);

  loginForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  cargando: boolean = false;
  uiSubscription?: Subscription;

  ngOnInit(): void {
    this.uiSubscription = this.store
      .select('ui')
      .subscribe((ui) => (this.cargando = ui.isLoading));
  }

  ngOnDestroy(): void {
    this.uiSubscription?.unsubscribe();
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.store.dispatch(ui.isLoading());

    const { correo, password } = this.loginForm.value;
    this.authService
      .loginUsuario(correo, password)
      .then(() => {
        this.store.dispatch(ui.stopLoading());
        this.router.navigate(['/']);
      })
      .catch((err) => {
        this.store.dispatch(ui.stopLoading());
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
        });
      });
  }
}
