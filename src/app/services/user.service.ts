import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  updateUserData(uid: any, userData: any) {
    throw new Error('Method not implemented.');
  }

  constructor(
    private fireStore: AngularFirestore, 
    private fireAuth: AngularFireAuth) {}

  // Método para crear un usuario
  async createUser(usuario: any) {
    try {
      const docRef = this.fireStore.collection('usuarios').doc(usuario.rut);
      const docActual = await docRef.get().toPromise();
  
      if (docActual?.exists) {
        return false;
      }
  
      const credencialesUsuario = await this.fireAuth.createUserWithEmailAndPassword(
        usuario.email,
        usuario.password
      );
      const uid = credencialesUsuario.user?.uid;
  
      await docRef.set({
        rut: usuario.rut,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        password: usuario.password,
        sucursal: usuario.sucursal,
        tipo_usuario: usuario.tipo_usuario,
        uid: uid,
      });
  
      return true;
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      return false;
    }
  }
  
  // Listar usuarios
  getUsers() {
    return this.fireStore.collection('usuarios').valueChanges();
  }

  // Listar usuario
  getUser(rut: string) {
    return this.fireStore.collection('usuarios').doc(rut).valueChanges();
  }

  // Actualizar usuario
  updateUser(usuario: any) {
    return this.fireStore.collection('usuarios').doc(usuario.rut).update(usuario);
  }

  // Eliminar usuario
  deleteUser(rut: string) {
    return this.fireStore.collection('usuarios').doc(rut).delete();
  }

  // Obtener usuario por UID
  getUsuarioByUID(uid: string): Promise<any> {
    return this.fireStore.collection('usuarios', ref => ref.where('uid', '==', uid))
      .get()
      .toPromise()
      .then((snapshot) => {
        if (snapshot && !snapshot.empty) {
          return snapshot.docs[0].data();
        }
        return null;
      })
      .catch((error) => {
        console.error('Error al obtener el usuario:', error);
        return null;
      });
  }
}
