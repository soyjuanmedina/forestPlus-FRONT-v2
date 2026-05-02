import { baseEnvironment } from "./environment.base";

export const environment = {
  ...baseEnvironment,
  production: false,
  name: 'local',
  envColor: '#2196f3', // Azul para diferenciar que es tu máquina local
  apiBaseUrl: 'http://localhost:8080',
  googleAnalyticsId: ''
};
