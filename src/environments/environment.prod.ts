import packageInfo from '../../package.json';

export const environment = {
  VERSION: packageInfo.version,
  production: true,
  apiUrl: 'https://api.chalet-gypaete.fr',
};
