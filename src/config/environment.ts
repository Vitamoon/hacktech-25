interface Config {
  apiUrl: string;
  mapApiKey: string;
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
}

const configs: Record<string, Config> = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    mapApiKey: 'dev-map-key',
    environment: 'development',
    debug: true,
  },
  staging: {
    apiUrl: 'https://staging-api.aquamonitor.com/api',
    mapApiKey: 'staging-map-key',
    environment: 'staging',
    debug: true,
  },
  production: {
    apiUrl: 'https://api.aquamonitor.com/api',
    mapApiKey: 'prod-map-key',
    environment: 'production',
    debug: false,
  },
};

const env = process.env.REACT_APP_ENV || 'development';
const config = configs[env] || configs.development;

export default config;