import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'eloradmin_lang';
  
  constructor(private translate: TranslateService) {
    this.initLanguage();
  }

  private initLanguage(): void {
    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    const defaultLang = savedLang || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(defaultLang);
  }

  setLanguage(lang: 'es' | 'eu'): void {
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'es';
  }

  getAvailableLanguages(): { code: string, name: string }[] {
    return [
      { code: 'es', name: 'Castellano' },
      { code: 'eu', name: 'Euskera' }
    ];
  }
}
