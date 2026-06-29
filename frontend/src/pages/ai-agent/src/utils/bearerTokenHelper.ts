import { globalMemberAPIUrl } from './env';
import request from '@/services/httpRequest';

const TOKEN = 'alphashop.ai.token';
const TOKEN_LONG = 'alphashop.ai.token.long';
export const UUID_KEY = 'alphashop.ai.identify';

export const getRefreshToken = () => {
  return localStorage.getItem(TOKEN_LONG);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(TOKEN_LONG, token);
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN, token);
};

export const removeRefreshToken = () => {
  localStorage.removeItem(TOKEN_LONG);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN);
};

export const refreshRefreshToken = () => { };

export const refreshToken = () => { };