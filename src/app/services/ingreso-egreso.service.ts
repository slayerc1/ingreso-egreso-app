import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  collectionSnapshots,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  getDocs,
  query,
  QueryDocumentSnapshot,
  where,
} from '@angular/fire/firestore';
// import { Store } from '@ngrx/store';

// import { AppState } from '../app.reducer';
import { IngresoEgreso } from '../models/ingreso-egreso.model';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IngresoEgresoService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  constructor() {}

  async crearIngresoEgreso(ingresoEgreso: IngresoEgreso) {
    const uid = this.authService.user!.uid;

    delete ingresoEgreso.uid;

    await addDoc(collection(this.firestore, uid, 'ingreso-egreso', 'items'), {
      ...ingresoEgreso,
    })
      .then((ref) => console.log('exito!', ref))
      .catch((err) => console.warn(err));
  }

  initIngresoEgresoListener(uid: string): Observable<IngresoEgreso[]> {
    return collectionSnapshots(
      collection(this.firestore, uid, 'ingreso-egreso', 'items')
    ).pipe(
      map((snapshot) =>
        snapshot.map(
          (doc) =>
            ({
              ...doc.data(),
              uid: doc.id,
            } as IngresoEgreso)
        )
      )
    );
  }

  borrarIngresoEgreso(uidItem: string): Promise<void> {
    const uidUsuario = this.authService.user!.uid;

    return deleteDoc(
      doc(this.firestore, uidUsuario, 'ingreso-egreso', 'items', uidItem)
    );
  }
}
