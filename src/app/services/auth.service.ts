import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { map, Observable, Subscription } from 'rxjs';

import { Usuario } from '../models/usuario.model';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private store = inject(Store<AppState>);

  private authState$ = authState(this.auth);
  private authStateSubscription: Subscription;

  constructor() {
    this.authStateSubscription = this.authState$.subscribe(
      async (fbUser: User | null) => {
        if (fbUser) {
          const user = await getDoc(doc(this.firestore, fbUser.uid, 'usuario'));
          this.store.dispatch(
            authActions.setUser({
              user: Usuario.fromFirebase(user.data() as Usuario),
            })
          );
        } else {
          this.store.dispatch(authActions.unSetUser());
        }
      }
    );
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
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
