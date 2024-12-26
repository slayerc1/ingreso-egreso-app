import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { AppState } from '../app.reducer';
import * as ui from '../shared/ui.actions';
import { IngresoEgresoService } from '../services/ingreso-egreso.service';
import { IngresoEgreso } from '../models/ingreso-egreso.model';

@Component({
  selector: 'app-ingresos-egresos',
  templateUrl: './ingresos-egresos.component.html',
  styles: ``,
})
export class IngresosEgresosComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ingresoEgresoService = inject(IngresoEgresoService);
  private store = inject(Store<AppState>);

  ingresoForm: FormGroup = this.fb.group({
    descripcion: ['', Validators.required],
    monto: ['', Validators.required],
  });
  tipo: string = 'ingreso';
  public cargando: boolean = false;
  public uiSubscription?: Subscription;

  ngOnInit(): void {
    this.uiSubscription = this.store
      .select('ui')
      .subscribe((ui) => (this.cargando = ui.isLoading));
  }

  ngOnDestroy(): void {
    this.uiSubscription?.unsubscribe();
  }

  guardar(): void {
    this.store.dispatch(ui.isLoading());
    if (this.ingresoForm.invalid) return;

    const { descripcion, monto } = this.ingresoForm.value;

    const ingresoEgreso = new IngresoEgreso(descripcion, monto, this.tipo);

    this.ingresoEgresoService
      .crearIngresoEgreso(ingresoEgreso)
      .then(() => {
        this.ingresoForm.reset();
        this.store.dispatch(ui.stopLoading());
        Swal.fire('Registro creado', descripcion, 'success');
      })
      .catch((err) => {
        this.store.dispatch(ui.stopLoading());
        +Swal.fire('Error', err.message, 'error');
      });
  }
}
