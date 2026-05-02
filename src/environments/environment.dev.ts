import { baseEnvironment } from "./environment.base";

export const environment = {
  ...baseEnvironment,
  production: false,
  name: 'development',
  envColor: '#ff9800', // El naranja que ya conoces
  apiBaseUrl: 'https://forestplusapp.com/development',
  googleAnalyticsId: ''
};
