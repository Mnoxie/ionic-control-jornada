import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

interface Usuario {
  apellido: string;
  email: string;
  nombre: string;
  password: string;
  rut: string;
  sucursal: string;
  tipo_usuario: string; // Puede ser "colaborador" o "administrador"
  uid: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {}

  // 🔹 Obtener el tipo de usuario desde Firestore
  getUserRole(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          console.warn('⚠️ No hay usuario autenticado.');
          return of(null);
        }

        console.log('✅ Usuario autenticado con UID:', user.uid);

        return this.firestore.collection<Usuario>('usuarios', ref => ref.where('uid', '==', user.uid))
          .valueChanges()
          .pipe(
            map((users: Usuario[]) => {
              if (!users || users.length === 0) {
                console.warn(`⚠️ No se encontró un usuario con UID: ${user.uid}`);
                return null;
              }
              
              const userData = users[0]; // 🔹 Se obtiene el primer usuario encontrado

              console.log('📜 Datos del usuario obtenidos de Firestore:', userData);

              return userData.tipo_usuario ?? null; // 🔹 Retorna "colaborador" o "administrador"
            }),
            catchError(error => {
              console.error('❌ Error obteniendo los datos del usuario:', error);
              return of(null);
            })
          );
      })
    );
  }
}
