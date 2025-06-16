import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isMenuVisible: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Filtramos los eventos de navegación para obtener solo 'NavigationEnd'
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd) // Filtra solo NavigationEnd
    ).subscribe((event) => {
      // 'event' será de tipo NavigationEnd, gracias a 'filter'
      const url = (event as NavigationEnd).urlAfterRedirects;
      // Desactivar el menú en la página de login o ghome
      if (url === '/login' || url === '/home') {
        this.isMenuVisible = false;
      } else {
        this.isMenuVisible = true;
      }
    });
  }
}
