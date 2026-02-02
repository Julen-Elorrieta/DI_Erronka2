/**
 * Aplikazioaren osagai nagusia
 * Router eta header osagaiak kudeatzen ditu
 */
import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './core/components/header/header';
import { filter } from 'rxjs';

/**
 * App osagai nagusia
 * Aplikazioaren erroko osagaia da, header-a eta router-a kudeatzen ditu
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  /** Aplikazioaren izenburua */
  protected readonly title = signal('PruebaErronka2');

  private router = inject(Router);

  /** Uneko bidearen signala */
  currentRoute = signal<string>('');

  /** Header-a erakutsi ala ez kalkulatzen du (login orrialdean ez da erakusten) */
  showHeader = computed(() => {
    return !this.currentRoute().includes('/login');
  });

  constructor() {
    // Nabigazio aldaketak entzun eta uneko bidea eguneratu
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });
  }
}
