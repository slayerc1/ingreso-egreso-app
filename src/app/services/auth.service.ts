import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  Unsubscribe,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  onSnapshot,
  setDoc,
} from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { map, Observable, Subscription } from 'rxjs';

import { Usuario } from '../models/usuario.model';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.actions';
import * as ingresoEgresoActions from '../ingreso-egreso/ingreso-egreso.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private store = inject(Store<AppState>);

  private authState$ = authState(this.auth);
  private authStateSubscription: Subscription;
  private userSubs?: Unsubscribe;
  private _user?: Usuario;

  get user() {
    return this._user;
  }

  constructor() {
    this.authStateSubscription = this.authState$.subscribe(
      async (fbUser: User | null) => {
        if (fbUser) {
          this.userSubs = onSnapshot(
            doc(this.firestore, fbUser.uid, 'usuario'),
            (docSanp) => {
              this._user = docSanp.data() as Usuario;
              this.store.dispatch(
                authActions.setUser({
                  user: Usuario.fromFirebase(this._user),
                })
              );
            }
          );
        } else {
          this.store.dispatch(authActions.unSetUser());
          this.store.dispatch(ingresoEgresoActions.unSetItems());
        }
      }
    );
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
    this.userSubs!();
  }

  async crearUsuario(
    nombre: string,
    email: string,
    password: string
  ): Promise<
    void | UserCredential | DocumentReference<DocumentData, DocumentData>
  > {
    const auth = getAuth();
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const newUser = new Usuario(user.uid, nombre, user.email!);
    return await setDoc(doc(this.firestore, newUser.uid, 'usuario'), {
      ...newUser,
    });
  }

  loginUsuario(email: string, password: string): Promise<UserCredential> {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  isAuth(): Observable<boolean> {
    return this.authState$.pipe(map((fbUser) => fbUser != null));
  }
}
