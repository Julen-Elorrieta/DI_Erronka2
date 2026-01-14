import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'es' | 'eu' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'eloradmin_lang';
  
  constructor(private translate: TranslateService) {
    this.initLanguage();
  }

  private initLanguage(): void {
    const savedLang = localStorage.getItem(this.STORAGE_KEY) as Language;
    const defaultLang = savedLang || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(defaultLang);
  }

  setLanguage(lang: Language): void {
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'es';
  }

  getAvailableLanguages(): { code: Language, name: string, flag: string }[] {
    return [
      { code: 'es', name: 'Castellano', flag: '🇪🇸' },
      { code: 'eu', name: 'Euskera', flag: '🏴' },
      { code: 'en', name: 'English', flag: '🇬🇧' }
    ];
  }
}
