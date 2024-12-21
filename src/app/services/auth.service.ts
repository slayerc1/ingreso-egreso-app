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
import { map, Observable, Subscription } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private authState$ = authState(this.auth);
  private authStateSubscription: Subscription;

  constructor() {
    this.authStateSubscription = this.authState$.subscribe(
      (fbUser: User | null) => {
        console.log(fbUser);
      }
    );
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  crearUsuario(
    nombre: string,
    email: string,
    password: string
  ): Promise<
    void | UserCredential | DocumentReference<DocumentData, DocumentData>
  > {
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, password).then(
      ({ user }) => {
        const newUser = new Usuario(user.uid, nombre, user.email!);
        return setDoc(doc(this.firestore, newUser.uid, 'usuario'), {
          ...newUser,
        });
      }
    );
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
