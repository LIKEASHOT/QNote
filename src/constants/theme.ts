export interface ColorToken {
  id: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  label: string;
}

export const CLAUDE_THEME = {
  bg: '#FAF7F2',
  cream: '#F3EBDD',
  card: '#FFFFFF',
  border: '#E8DFD1',
  borderLight: '#F0E9DF',
  text: '#38332B',
  textSecondary: '#58544E',
  textMuted: '#847D72',
  textFaint: '#A4A09A',
  placeholder: '#C4B8A5',
  backdrop: 'rgba(44, 39, 35, 0.35)',
  clay: '#C97B63',
  clayLight: '#FAF0ED',
  clayDark: '#B66B54',
  clayDeep: '#A45842',
  clayBorder: '#F0D5CD',
} as const;

export const NATURAL_PALETTES: Record<string, ColorToken> = {
  clay: {
    id: 'clay',
    color: '#C97B63',
    bgColor: '#FAF0ED',
    textColor: '#A45842',
    borderColor: '#F0D5CD',
    label: '陶土橙',
  },
  sage: {
    id: 'sage',
    color: '#9EAD90',
    bgColor: '#F2F5F0',
    textColor: '#526046',
    borderColor: '#E1EAD8',
    label: '鼠尾草绿',
  },
  gold: {
    id: 'gold',
    color: '#D6B16C',
    bgColor: '#FAF5EB',
    textColor: '#8C6C26',
    borderColor: '#F0E5CE',
    label: '暖琥珀金',
  },
  slate: {
    id: 'slate',
    color: '#889BA8',
    bgColor: '#F0F4F7',
    textColor: '#435866',
    borderColor: '#DCE4EB',
    label: '雾霾蓝',
  },
  cinnamon: {
    id: 'cinnamon',
    color: '#B58872',
    bgColor: '#F8F2EF',
    textColor: '#7E533F',
    borderColor: '#EFE2DC',
    label: '复古肉桂',
  },
  rose: {
    id: 'rose',
    color: '#C28490',
    bgColor: '#FBF0F2',
    textColor: '#824854',
    borderColor: '#F5DBE0',
    label: '干枯玫瑰',
  },
  olive: {
    id: 'olive',
    color: '#B0A880',
    bgColor: '#F8F7EE',
    textColor: '#635D38',
    borderColor: '#E7E3CF',
    label: '柔和橄榄',
  },
  charcoal: {
    id: 'charcoal',
    color: '#777A80',
    bgColor: '#F1F2F3',
    textColor: '#484B50',
    borderColor: '#E2E4E7',
    label: '玄武暗灰',
  },
};
