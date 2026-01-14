/**
 * Configuración de entorno de PRODUCCIÓN
 * Base de datos: elordb en servidor 10.5.104.100
 */
export const environment = {
  production: true,
  apiUrl: 'http://10.5.104.100:3000/api',
  database: {
    host: '10.5.104.100',
    name: 'elordb'
  },
  mapbox: {
    accessToken: 'YOUR_MAPBOX_TOKEN_HERE'
  }
};
