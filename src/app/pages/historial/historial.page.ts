import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MenuController } from '@ionic/angular'; // Importa MenuController
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  searchQuery: string = ''; // Consulta de búsqueda
  historial: any[] = []; // Historial completo desde Firebase
  filteredHistorial: any[] = []; // Historial filtrado
  startDate: string = ''; // Fecha de inicio seleccionada
  endDate: string = ''; // Fecha de fin seleccionada

  constructor(private fireStore: AngularFirestore, private menuCtrl: MenuController) {} // Inyecta MenuController

  ngOnInit() {
    this.loadHistorial(); // Cargar historial de asistencia desde Firebase
  }

  // Cargar historial desde Firebase
  loadHistorial() {
    this.fireStore
      .collection('asistencias') // Colección de asistencias en Firebase
      .valueChanges({ idField: 'id' }) // Incluye el ID del documento
      .subscribe((data: any[]) => {
        this.historial = data; // Asignar los datos obtenidos
        this.filteredHistorial = data; // Inicializar el historial filtrado
      });
  }

  // Método para buscar por nombre, apellido o RUT
  onSearch(event: any) {
    const query = event.detail.value.toLowerCase();
    this.filterHistorial(query, this.startDate, this.endDate); // Filtrar por consulta y fechas
  }

  // Método para filtrar por fechas
  onDateChange() {
    this.filterHistorial(this.searchQuery, this.startDate, this.endDate); // Filtrar por búsqueda y fechas
  }

  // Filtrar historial basado en la búsqueda y las fechas seleccionadas
  filterHistorial(query: string, startDate: string, endDate: string) {
    const start = startDate ? new Date(startDate) : null; // Convertir fecha de inicio a Date
    const end = endDate ? new Date(endDate) : null; // Convertir fecha de fin a Date

    this.filteredHistorial = this.historial.filter((item) => {
      // Filtrar por nombre, apellido o RUT
      const matchesQuery =
        item.nombre_empleado.toLowerCase().includes(query) ||
        item.apellido_empleado.toLowerCase().includes(query) ||
        item.empleado_id.includes(query);

      // Convertir fechas de Firestore a objetos Date
      const fechaInicio = new Date(item.fecha_inicio.seconds * 1000);
      const fechaFin = new Date(item.fecha_fin ? item.fecha_fin.seconds * 1000 : fechaInicio); // Manejar fechaFin opcional

      // Filtrar por rango de fechas
      const matchesDateRange =
        (!start || fechaInicio >= start) && (!end || fechaFin <= end);

      return matchesQuery && matchesDateRange; // Filtrar por nombre y fechas
    });
  }

  descargarExcel() {
  const data = this.filteredHistorial.map(item => {
    const fechaInicio = new Date(item.fecha_inicio.seconds * 1000);
    const fechaFin = item.fecha_fin ? new Date(item.fecha_fin.seconds * 1000) : null;

    return {
      'Nombre': item.nombre_empleado,
      'Apellido': item.apellido_empleado,
      'RUT': item.empleado_id,
      'Fecha Inicio': fechaInicio.toLocaleString(),
      'Fecha Fin': fechaFin ? fechaFin.toLocaleString() : 'N/A',
      'Estado': item.estado,
      'Tiempo Jornada': item.tiempo_jornada
    };
  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const workbook: XLSX.WorkBook = { Sheets: { 'Historial': worksheet }, SheetNames: ['Historial'] };

  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  FileSaver.saveAs(blob, 'historial_asistencia.xlsx');
}


  // Método para abrir el menú
  openMenu() {
    this.menuCtrl.open('main-menu'); // Abre el menú con el ID 'main-menu'
  }
}
