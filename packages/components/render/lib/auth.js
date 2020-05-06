import { getStore, setStore, removeStore } from "./store";
const TokenKey = "token";
const RefreshTokenKey = "refresh-token";

export function getUserInfo() {
  let userInfo = getStore({ name: "userInfo" });
  if (userInfo && userInfo.elsAccount) {
    return userInfo;
  }
  return { elsAccount: "307000", elsSubAccount: "1001" };
}

export function getToken() {
  return getStore({ name: TokenKey });
}

export function setToken(token) {
  return setStore({ name: TokenKey, content: token });
}

export function getRefreshToken() {
  return getStore({ name: RefreshTokenKey });
}

export function setRefreshToken(token) {
  return setStore({ name: RefreshTokenKey, content: token });
}

export function removeToken() {
  return removeStore({ name: TokenKey });
}

export function removeRefreshToken() {
  return removeStore({ name: RefreshTokenKey });
}
const auth = {
  getUserInfo,
  getToken,
  setToken,
  getRefreshToken,
  removeToken,
  removeRefreshToken
};

export default auth;
