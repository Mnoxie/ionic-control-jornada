import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.getUserRole().pipe(
      map(role => {
        if (!role) {
          console.warn('⚠️ No se encontró el rol del usuario. Redirigiendo a login...');
          this.router.navigate(['/login']);
          return false;
        }

        const url = state.url;

        // 🔹 Rutas permitidas para cada rol
        const colaboradorRoutes = ['/login', '/home', '/hora-extra', '/codigo-extra'];
        const adminRoutes = ['/login', '/register', '/administracion', '/historial'];

        if (role === 'colaborador' && !colaboradorRoutes.includes(url)) {
          console.warn(`🚫 Acceso denegado a ${url}. Redirigiendo a /home...`);
          this.router.navigate(['/home']);
          return false;
        }

        if (role === 'administrador' && !adminRoutes.includes(url)) {
          console.warn(`🚫 Acceso denegado a ${url}. Redirigiendo a /historial...`);
          this.router.navigate(['/historial']);
          return false;
        }

        console.log('🟢 Acceso permitido a', url);
        return true;
      })
    );
  }
}
