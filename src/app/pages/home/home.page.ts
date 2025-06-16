import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/services/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { AlertController } from '@ionic/angular';  // <-- Importa AlertController

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  empleado: any = {}; 
  currentTime: string = '';
  estadoJornada: string = '';

  constructor(
    private userService: UserService,
    private fireStore: AngularFirestore,
    private fireAuth: AngularFireAuth,
    private cd: ChangeDetectorRef,
    private alertController: AlertController  // <-- Inyección en el constructor
  ) {}

  ngOnInit() {
    this.loadEmployeeData();
    this.startClock();
  }

  async loadEmployeeData() {
    const user = await this.fireAuth.currentUser;
    if (user) {
      this.empleado = await this.userService.getUsuarioByUID(user.uid);
      this.cd.detectChanges();
    }
  }

  startClock() {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000);
  }

  async iniciarJornada() {
    try {
      const fechaInicio = new Date();
      const jornadaData = {
        empleado_id: this.empleado.rut,
        nombre_empleado: this.empleado.nombre,
        apellido_empleado: this.empleado.apellido, // <-- agregado aquí
        sucursal: this.empleado.sucursal,
        fecha_inicio: fechaInicio,
        estado: 'iniciado',
      };
  
      const jornadaId = `${this.empleado.rut}_${fechaInicio.getTime()}`;
      await this.fireStore.collection('asistencias').doc(jornadaId).set(jornadaData);
      localStorage.setItem('jornadaActual', jornadaId);
      this.estadoJornada = 'iniciado';
  
      console.log('Jornada iniciada correctamente');
    } catch (error) {
      console.error('Error al iniciar la jornada:', error);
    }
  }

  async finalizarJornada() {
    const jornadaId = localStorage.getItem('jornadaActual');
    if (!jornadaId) {
      console.error('No se encontró una jornada activa');
      return;
    }

    try {
      const jornadaDoc = await this.fireStore.collection('asistencias').doc(jornadaId).get().toPromise();
      if (!jornadaDoc?.exists) {
        console.error('No se encontró la jornada en Firestore');
        return;
      }

      // Definir explícitamente el tipo de los datos recuperados
      const jornadaData = jornadaDoc.data() as { fecha_inicio?: any };

      if (!jornadaData || !jornadaData.fecha_inicio) {
        console.error('Datos de jornada incorrectos o fecha de inicio no encontrada');
        return;
      }

      // Verificar si fecha_inicio es un Timestamp y convertirlo a Date
      const fechaInicio = jornadaData.fecha_inicio instanceof Date 
        ? jornadaData.fecha_inicio 
        : jornadaData.fecha_inicio.toDate ? jornadaData.fecha_inicio.toDate() 
        : new Date(jornadaData.fecha_inicio);

      const fechaFin = new Date();
      const tiempoJornada = this.calcularDiferencia(fechaInicio, fechaFin);

      await this.fireStore.collection('asistencias').doc(jornadaId).update({
        fecha_fin: fechaFin,
        estado: 'finalizado',
        tiempo_jornada: tiempoJornada,
      });

      console.log('Jornada finalizada correctamente');
      this.estadoJornada = 'finalizado';
      localStorage.removeItem('jornadaActual');
    } catch (error) {
      console.error('Error al finalizar la jornada:', error);
    }
  }

  calcularDiferencia(fechaInicio: Date, fechaFin: Date): string {
    const diferencia = fechaFin.getTime() - fechaInicio.getTime();
    if (diferencia < 0) return 'Error en las fechas';

    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    return `${horas}h ${minutos}m ${segundos}s`;
  }

  async registrarHoraExtra() {
    // Se muestra una ventana de alerta con input al presionar "Hora Extra"
    const alert = await this.alertController.create({
      header: 'INGRESAR CODIGO',
      inputs: [
        {
          name: 'codigo',
          type: 'text',
          placeholder: 'Ingresa el código'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: (data) => {
            console.log('Código ingresado:', data.codigo);
            // Aquí puedes agregar la lógica para validar o utilizar el código ingresado
          }
        }
      ]
    });

    await alert.present();
  }
}
