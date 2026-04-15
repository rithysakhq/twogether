export type ThemeName = 'light' | 'dark';

export type Palette = {
  background: string;
  card: string;
  text: string;
  textMuted: string;
};

export const Colors: { primary: string } & Record<ThemeName, Palette> = {
  // Shared accent — identical across both themes
  primary: '#FF2A5F',

  light: {
    background: '#FFFFFF',
    card: '#F2F2F7',
    text: '#000000',
    textMuted: '#8E8E93',
  },

  dark: {
    background: '#0F0F13',
    card: '#1C1C21',
    text: '#FFFFFF',
    textMuted: '#8E8E93',
  },
};
