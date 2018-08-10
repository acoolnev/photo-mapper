import {secretEnvironment } from './environment.secret';

export const environment = {
  production: true,
  ...secretEnvironment
};
