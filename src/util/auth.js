import { getStore } from './store';
const TokenKey = 'token';
const RefreshTokenKey = 'refresh-token';

export function getUserInfo() {
  const userInfo = getStore({ name: 'userInfo' });
  if (userInfo && userInfo.elsAccount) {
    return userInfo;
  }
  return { elsAccount: '307000', elsSubAccount: '1001' };
}

export function getToken() {
  return localStorage.getItem(TokenKey);
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token);
}

export function getRefreshToken() {
  return localStorage.getItem(RefreshTokenKey);
}

export function setRefreshToken(token) {
  return localStorage.setItem(RefreshTokenKey, token);
}

export function removeToken() {
  return localStorage.removeItem(TokenKey);
}

export function removeRefreshToken() {
  return localStorage.removeItem(RefreshTokenKey);
}
