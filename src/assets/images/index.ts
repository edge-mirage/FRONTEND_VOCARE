// src/assets/images/logos/index.ts
export const logos = {
  dark:  require('./logo-dark.png'),
  light:   require('./logo-light.png'),
} as const;
export type LogoKey = keyof typeof logos;