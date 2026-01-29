// src/app/core/services/language.service.ts
import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
  code: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLanguage = signal<string>('es');
  
  languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'eu', name: 'Euskera' }
  ];

  constructor(private translate: TranslateService) {
    // Obtener idioma guardado o usar español por defecto
    const savedLang = localStorage.getItem('language') || 'eu';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
  }

  getCurrentLanguage(): Language | undefined {
    return this.languages.find(l => l.code === this.currentLanguage());
  }
}