import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';  // Verifica la ruta


const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard] // Solo accesible para colaboradores
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule),
    canActivate: [AuthGuard] // Solo accesible para administradores
  },
  {
    path: 'historial',
    loadChildren: () => import('./pages/historial/historial.module').then(m => m.HistorialPageModule),
    canActivate: [AuthGuard] // Solo accesible para administradores
  },
  {
    path: 'administracion',
    loadChildren: () => import('./pages/administracion/administracion.module').then(m => m.AdministracionPageModule),
    canActivate: [AuthGuard] // Solo accesible para administradores
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
