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
    // Eskuragarri dauden hizkuntzak konfiguratu
    this.translate.addLangs(['eu', 'es', 'en']);
    this.translate.setDefaultLang('eu');
  }

  ngOnInit(): void {
    // Erabiltzailea localStorage-tik kargatu existitzen bada
    this.authService.loadUserFromStorage();
  }
}
