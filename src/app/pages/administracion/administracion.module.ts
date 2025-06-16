import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdministracionPageRoutingModule } from './administracion-routing.module';

import { AdministracionPage } from './administracion.page';
import { RegisterPageRoutingModule } from '../register/register-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdministracionPageRoutingModule,
    RegisterPageRoutingModule,  // Sólo una importación aquí
    ReactiveFormsModule,
  ],
  declarations: [AdministracionPage]
})
export class AdministracionPageModule {}
