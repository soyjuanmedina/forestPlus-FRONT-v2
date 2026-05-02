import { baseEnvironment } from "./environment.base";

export const environment = {
  ...baseEnvironment,
  production: true,
  name: 'production',
  envColor: '#1b5e20', // Un verde oscuro para producción (aunque no se vea el banner)
  apiBaseUrl: 'https://forestplusapp.com',
  googleAnalyticsId: 'G-XXXXXXXXXX' // Reemplaza con tu ID de seguimiento
};
