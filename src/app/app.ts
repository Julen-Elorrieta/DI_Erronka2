import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ElorAdmin');

  constructor(
    private translate: TranslateService,
    private authService: AuthService
  ) {
    // Configurar idiomas disponibles
    this.translate.addLangs(['es', 'eu']);
    this.translate.setDefaultLang('es');
  }

  ngOnInit(): void {
    // Cargar usuario de localStorage si existe
    this.authService.loadUserFromStorage();
  }
}
