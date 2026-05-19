export const API_URL = '/api';
export const APP_NAME = 'KVJ-Evolution School';

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const NIVEAUX = ['L1', 'L2', 'L3'] as const;
export type Niveau = typeof NIVEAUX[number];

export const COURSE_CATEGORIES = [
  'Informatique',
  'Mathématiques',
  'Physique',
  'Chimie',
  'Français',
  'Anglais',
  'Sciences',
  'Économie',
] as const;
