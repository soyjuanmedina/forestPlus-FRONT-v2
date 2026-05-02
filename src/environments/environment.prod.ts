import { baseEnvironment } from "./environment.base";

export const environment = {
  ...baseEnvironment,
  production: true,
  name: 'production',
  envColor: '#1b5e20', // Un verde oscuro para producción (aunque no se vea el banner)
  launchDate: "2026-06-01T00:00:00",
  apiBaseUrl: 'https://forestplusapp.com',
  googleAnalyticsId: 'G-XXXXXXXXXX' // Reemplaza con tu ID de seguimiento
};
