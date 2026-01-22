import { environment } from '../../../environments/environment';

/**
 * Utilidad para construir URLs de API
 * Centraliza la lógica de obtención de apiUrl de environment
 */
export class ApiUtil {
  /**
   * Obtiene la URL base de la API desde environment
   * @returns URL de la API
   */
  static getApiUrl(): string {
    return Array.isArray(environment.apiUrl)
      ? environment.apiUrl.join('')
      : environment.apiUrl;
  }

  /**
   * Construye una URL completa de API con endpoint
   * @param endpoint - Endpoint de la API (ej: '/users', '/meetings')
   * @param params - Parámetros opcionales de query
   * @returns URL completa
   */
  static buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = this.getApiUrl();
    let url = `${baseUrl}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const queryParams = Object.entries(params)
        .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

      if (queryParams) {
        url += `?${queryParams}`;
      }
    }

    return url;
  }
}
