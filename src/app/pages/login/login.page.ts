import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  
  email: string = '';       
  password: string = '';    

  constructor(
    private router: Router,
    private userService: UserService,
    private fireAuth: AngularFireAuth
  ) {}

  ngOnInit() {}
  isLoggingIn = false;
  // Método para autenticar al usuario con Firebase
  async login() {
    if (!this.email || !this.password) {
      alert('Por favor, ingrese el correo electrónico y la contraseña.');
      return;
    }
  
    this.isLoggingIn = true; // 🔽 Deshabilita el botón mientras carga
  
    try {
      const userCredential = await this.fireAuth.signInWithEmailAndPassword(this.email, this.password);
      const user = userCredential.user;
      if (!user) {
        throw new Error('No se pudo obtener el usuario.');
      }
  
      const uid = user.uid;
      console.log('Usuario autenticado con UID:', uid);
  
      const userData = await this.userService.getUsuarioByUID(uid);
      if (userData) {
        console.log('Datos del usuario:', userData);
        sessionStorage.setItem('usuario', JSON.stringify(userData)); 
  
        setTimeout(() => {
          document.body.focus();
          this.router.navigate(['/home']);
          this.isLoggingIn = false;
        }, 100);
  
      } else {
        alert('No se encontraron datos del usuario.');
        this.isLoggingIn = false;
      }
    } catch (error: any) {
      this.handleLoginError(error);
      this.isLoggingIn = false;
    }
  }

  // Manejo de errores de Firebase
  handleLoginError(error: any) {
    let message = 'Error al iniciar sesión.';
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No se encontró un usuario con este correo.';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta. Inténtelo de nuevo.';
        break;
      case 'auth/invalid-email':
        message = 'El formato del correo es inválido.';
        break;
      case 'auth/user-disabled':
        message = 'Esta cuenta ha sido deshabilitada.';
        break;
    }
    console.error('Error durante el inicio de sesión:', error);
    alert(message);
  }
}
