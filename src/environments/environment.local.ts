import { baseEnvironment } from "./environment.base";

export const environment = {
  ...baseEnvironment,
  production: false,
  name: 'local',
  envColor: '#2196f3', // Azul para diferenciar que es tu máquina local
  launchDate: "2024-01-01T00:00:00",
  apiBaseUrl: 'http://localhost:8080',
  googleAnalyticsId: ''
};
