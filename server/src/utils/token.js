import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import env from '../config/env.js';

export const COOKIE_NAME = 'ls_token';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const baseCookie = () => ({ httpOnly: true, secure: env.COOKIE_SECURE, sameSite: env.COOKIE_SAME_SITE, path: '/' });

export const signToken = (userId) => jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
export const setAuthCookie = (res, userId) => res.cookie(COOKIE_NAME, signToken(userId), { ...baseCookie(), maxAge: SEVEN_DAYS });
export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, baseCookie());
export const tokenFromCookieHeader = (header = '') => parse(header)[COOKIE_NAME];
