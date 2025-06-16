import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service'
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.page.html',
  styleUrls: ['./administracion.page.scss'],
})
export class AdministracionPage implements OnInit {
  
  //Grupo usuario
    usuario = new FormGroup({
      rut : new FormControl('',[Validators.minLength(9),Validators.maxLength(10),Validators.pattern("[0-9]{7,8}-[0-9kK]{1}")]),
      nombre : new FormControl('',[Validators.minLength(3)]),
      apellido : new FormControl('',[Validators.minLength(3)]),
      email : new FormControl('',[Validators.required,Validators.email]),
      password : new FormControl('',[Validators.required]),
      repeat_password : new FormControl('',[Validators.required]),
      sucursal : new FormControl('',[Validators.required]),
      tipo_usuario: new FormControl('colaborador', [Validators.required]), // Valor por defecto 'normal'
    });

    usuarios:any[] = [];
    botonModificar: boolean = true;

  constructor(private alertController: AlertController,
              private userService: UserService,
              private menuCtrl: MenuController,
  ) { this.usuario.get("rut")?.setValidators([Validators.required,Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),this.validarRut()])}

  async ngOnInit() {
    this.cargarUsuarios();
    
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


    //CRUD USUARIOS

    cargarUsuarios(){
      this.userService.getUsers().subscribe((data:any)=>{
        this.usuarios = data;
      })
    }

    
    async registrar(){
      if(this.isPasswordMismatch()){
        alert("ERROR! LAS CONTRASEÑAS NO COINCIDEN!");
        return;
      }

      if(await this.userService.createUser(this.usuario.value)){
        await this.presentAlert(
          'Operacion exitosa', 
          'Registrado', 
          'Usuario registrado con exito'
        );
        this.usuario.reset();
      }else{
        await this.presentAlert(
          'Operacion fallida', 
          'No ha sido registrado', 
          'Ha ocurrido un problema, revisa los datos ingresados.'
        );
      }
    }


    async buscar(usuarioSeleccionado:any){
      this.usuario.patchValue({
        rut: usuarioSeleccionado.rut,
        nombre: usuarioSeleccionado.nombre,
        apellido: usuarioSeleccionado.apellido,
        email: usuarioSeleccionado.email,
        password: usuarioSeleccionado.password,
        sucursal: usuarioSeleccionado.sucursal,
        tipo_usuario: usuarioSeleccionado.tipo_usuario
      });
      this.botonModificar = false;
    }

    async modificar() {
      const alert = await this.alertController.create({
        header: 'Confirmar modificación',
        message: '¿Estás seguro de que deseas modificar este usuario?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Modificación cancelada');
            }
          },
          {
            text: 'OK',
            role: 'confirm',
            handler: async () => {
              if (!this.isPasswordMismatch()) {
                const rut_buscar: string = this.usuario.controls.rut.value || "";
                
                // Llamada a Firebase para actualizar el usuario
                this.userService.updateUser(this.usuario.value).then(async () => {
                  // Mensaje de éxito
                  await this.presentAlert('Éxito', 'Usuario modificado', 'USUARIO MODIFICADO CON ÉXITO!');
                  
                  // Restablece el formulario
                  this.usuario.reset();
                  this.botonModificar = true;
                  
                }).catch(async (error) => {
                
                  await this.presentAlert('Error', 'No se pudo modificar', 'ERROR! USUARIO NO MODIFICADO!');
                  console.error("Error al modificar el usuario:", error);
                });
              } else {
                await this.presentAlert('Error', 'Contraseñas no coinciden', 'ERROR! LAS CONTRASEÑAS NO COINCIDEN!');
              }
            }
          }
        ]
      });
    
      await alert.present();
    }



    async eliminar(rut_eliminar:string){
      const alert = await this.alertController.create({
        header: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar este usuario?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Eliminación cancelada');
            }
          },
          {
            text: 'OK',
            role: 'confirm',
            handler: async () => {
              
              this.userService.deleteUser(rut_eliminar).then(async () => {
                
                await this.presentAlert('Éxito', 'Usuario eliminado', 'USUARIO ELIMINADO CON ÉXITO!');
                
                
              }).catch(async (error) => {
                
                await this.presentAlert('Error', 'No se pudo eliminar', 'ERROR! USUARIO NO ELIMINADO!');
                console.error("Error al eliminar el usuario:", error);
              });
            }
          }
        ]
      });
    
      await alert.present();
    }
    

    openMenu() {
      this.menuCtrl.open('main-menu');
    }

}
