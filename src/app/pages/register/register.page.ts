import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { MenuController } from '@ionic/angular'; // Importa MenuController

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  //Grupo usuario
  usuario = new FormGroup({
    rut : new FormControl('',[Validators.minLength(9),Validators.maxLength(10),Validators.pattern("[0-9]{7,8}-[0-9kK]{1}")]),
    nombre : new FormControl('',[Validators.minLength(3)]),
    apellido : new FormControl('',[Validators.minLength(3)]),
    email : new FormControl('',[Validators.required,Validators.email]),
    password : new FormControl('',[Validators.required]),
    repeat_password : new FormControl('',[Validators.required]),
    sucursal : new FormControl('',[Validators.required]),
    tipo_usuario: new FormControl('colaborador', []), // Valor por defecto 'normal'
  });

  
  constructor(private userService : UserService,
    private alertController: AlertController,
    private menuCtrl: MenuController,
    private router: Router) { 
    this.usuario.get("rut")?.setValidators([Validators.required,Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),this.validarRut()]);
  }

  ngOnInit() {
  }



  //Validaciones
  validarRut(): ValidatorFn {
    return (control: AbstractControl) => {
      const rut = control.value; // Obtén el valor directamente del control
      if (!rut) return null;
  
      const dv_validar = rut.replace("-", "").split("").splice(-1).reverse()[0];
      let rut_limpio = [];
      if (rut.length == 10) {
        rut_limpio = rut.replace("-", "").split("").splice(0, 8).reverse();
      } else {
        rut_limpio = rut.replace("-", "").split("").splice(0, 7).reverse() || [];
      }
      let factor = 2;
      let total = 0;
      for (let num of rut_limpio) {
        total = total + (+num) * factor;
        factor = factor + 1;
        if (factor == 8) {
          factor = 2;
        }
      }
      let dv = (11 - (total % 11)).toString();
      if (+dv >= 10) {
        dv = "k";
      }
      if (dv_validar != dv.toString()) return { isValid: false };
      return null;
    };
  }
  
  

  // Método para comprobar si las contraseñas coinciden
  isPasswordMismatch(): boolean {
    const password = this.usuario.get('password')?.value;
    const repeatPassword = this.usuario.get('repeat_password')?.value;

    // Asegúrate de que siempre devuelva un booleano
    return !!(password && repeatPassword && password !== repeatPassword);
  }


  // Registro de usuario
  public async userRegister() {
    if (this.isPasswordMismatch()) {
      console.error('Las contraseñas no coinciden.');
      return;
    }

    const usuarioData = this.usuario.value;

    try {
      // Llamada al servicio para crear el usuario
      const isCreated = await this.userService.createUser(usuarioData);

      if (isCreated) {
        this.presentAlert('¡Bienvenido a TravelSt!', 'Comienza tu aventura con nosotros', 'Tu cuenta ha sido creada exitosamente. Ya puedes empezar a explorar y planificar tu próximo viaje.');
        this.router.navigate(['login']);
      } else {
        this.presentAlert('Error', '', 'No se pudo crear el usuario. Puede que ya exista en la base de datos.');
      }

    } catch (error) {
      console.error('Error al crear el usuario', error);
      this.presentAlert('Error', 'Ocurrió un problema', 'No se pudo crear el usuario. Por favor, intenta más tarde.');
    }
  }
  
  
  //Alerta para testing
  alertButtons = ['Aceptar'];
  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['Aceptar'],
    });

    await alert.present();
  }

  openMenu() {
    this.menuCtrl.open('main-menu'); // Abre el menú con el ID 'main-menu'
  }
}
