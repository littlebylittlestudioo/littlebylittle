// src/nav-utils.js

import { STORAGE_KEYS, ROUTES } from './constants.js';

export function navigate(page, options = {}) {
  const { redirect = null, back = null } = options;

  if (redirect) localStorage.setItem(STORAGE_KEYS.REDIRECT, redirect);
  if (back) localStorage.setItem(STORAGE_KEYS.BACK, back);

  window.location.href = page;
}

export function requireLogin(redirectPage, backPage) {
  if (!localStorage.getItem(STORAGE_KEYS.LOGGED_IN)) {
    navigate(ROUTES.LOGIN, { redirect: redirectPage, back: backPage });
    return false;
  }
  return true;
}

export function goHome() {
  navigate(ROUTES.HOME);
}

export function getRedirectPage() {
  return localStorage.getItem(STORAGE_KEYS.REDIRECT);
}

export function getBackPage() {
  return localStorage.getItem(STORAGE_KEYS.BACK);
}

export function clearNavState() {
  localStorage.removeItem(STORAGE_KEYS.REDIRECT);
  localStorage.removeItem(STORAGE_KEYS.BACK);
}
