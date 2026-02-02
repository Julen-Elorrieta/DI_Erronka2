import { environment } from '../../../environments/environment';

/**
 * API URLak eraikitzeko utilitatea
 * Environment-etik apiUrl lortzeko logika zentralizatzen du
 */
export class ApiUtil {
  /**
   * APIaren oinarrizko URLa eskuratzen du environment-etik
   * @returns APIaren URLa
   */
  static getApiUrl(): string {
    return Array.isArray(environment.apiUrl) ? environment.apiUrl.join('') : environment.apiUrl;
  }

  /**
   * API URL osoa eraikitzen du endpoint-arekin
   * @param endpoint - APIaren endpoint-a (adib: '/users', '/meetings')
   * @param params - Query parametro aukerakoak
   * @returns URL osoa
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
