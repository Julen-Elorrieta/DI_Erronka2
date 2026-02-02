/**
 * Hizkuntza zerbitzua
 * Aplikazioaren hizkuntza aldaketak kudeatzen ditu
 */
import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Hizkuntzaren interfazea
 * Hizkuntza baten datuak definitzen ditu
 */
export interface Language {
  code: string;  // Hizkuntza kodea (eu, es, en)
  name: string;  // Hizkuntzaren izena
}

/**
 * Hizkuntza zerbitzua
 * Aplikazioaren i18n kudeaketa egiten du
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  /** Uneko hizkuntza signala */
  currentLanguage = signal<string>('es');

  /** Hizkuntza eskuragarrien zerrenda */
  languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'eu', name: 'Euskera' },
  ];

  constructor(private translate: TranslateService) {
    // Gordetako hizkuntza eskuratu edo euskera erabili defektuz
    const savedLang = localStorage.getItem('language') || 'eu';
    this.setLanguage(savedLang);
  }

  /** Hizkuntza aldatzen du */
  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
  }

  /** Uneko hizkuntza eskuratzen du */
  getCurrentLanguage(): Language | undefined {
    return this.languages.find((l) => l.code === this.currentLanguage());
  }
}
