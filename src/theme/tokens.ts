import type { EventPreview, SportOption } from '../types/domain';

export const colors = {
  background: '#FFF4F4',
  backgroundWarm: '#FFF0EC',
  surface: '#FFF7F5',
  surfaceStrong: '#FFFFFF',
  surfaceMuted: 'rgba(255, 255, 255, 0.72)',
  surfaceSoft: 'rgba(255, 255, 255, 0.48)',
  text: '#4D212A',
  textMuted: '#7D5A62',
  textSoft: '#9B7A81',
  primary: '#FF5E5E',
  primaryDeep: '#AF232B',
  primarySoft: '#FFDADA',
  mint: '#BCE7DE',
  lilac: '#E8D7FF',
  peach: '#FFD8C7',
  success: '#2F8E6D',
  warning: '#F59E0B',
  danger: '#C0395A',
  white: '#FFFFFF',
  overlayDark: 'rgba(58, 20, 29, 0.38)',
  overlaySoft: 'rgba(255, 244, 244, 0.18)',
  ghostBorder: 'rgba(94, 31, 43, 0.12)',
  shadow: 'rgba(77, 33, 42, 0.08)',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  md: 18,
  lg: 28,
  xl: 36,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  button: {
    shadowColor: 'rgba(175, 35, 43, 0.22)',
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
};

export const heroBackgroundImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2mbMhImhxwC07GVP5SaD-if6ZDaG72shQ_sPg1wEKY1F7O8e9UTZKvk-vmgas31xkRYupO9aC34cNzLMYQY1It2jK9mM2OWVH18cSLSVnY3kELb2Vd53RnctwqOPGpU3ehHIgcJre2ebqmNoJhkRHtGk4SfAEoX01yLbox1QD0-epyJVbPFVxH9KR7T0y3I0nwodKBQeTKxctdp5hg7KHTobLSZYeQeo0SivRn0UKBieI_bdLnzorZlzD4zPp-XAwrNKUJ7ApHb0';

export const sportOptions: SportOption[] = [
  {
    id: 'road_cycling',
    label: 'Ciclismo Ruta',
    subtitle: 'Pelotones seguros y puntos de encuentro claros',
    iconName: 'bike-fast',
    accent: ['#FF8A8A', '#AF232B'],
  },
  {
    id: 'mtb',
    label: 'MTB',
    subtitle: 'Salidas tecnicas con lideres verificadas',
    iconName: 'bike',
    accent: ['#FFAF8A', '#E0552B'],
  },
  {
    id: 'running',
    label: 'Running',
    subtitle: 'Ritmos compartidos para ciudad y parque',
    iconName: 'run-fast',
    accent: ['#BCE7DE', '#2F8E6D'],
  },
  {
    id: 'trekking',
    label: 'Trekking',
    subtitle: 'Senderos con comunidad y check-ins previos',
    iconName: 'hiking',
    accent: ['#E8D7FF', '#7A5CC3'],
  },
  {
    id: 'trail_running',
    label: 'Trail Running',
    subtitle: 'Altimetria, apoyo mutuo y planes visibles',
    iconName: 'shoe-sneaker',
    accent: ['#FFD8C7', '#C56A45'],
  },
];

export const sampleEvents: EventPreview[] = [
  {
    id: 'event-1',
    title: 'Sunrise Tempo Costanera',
    sport: 'Running',
    schedule: 'Domingo · 07:15',
    location: 'Parque Bicentenario, Vitacura',
    organizer: 'Paula R.',
    participants: 18,
  },
  {
    id: 'event-2',
    title: 'Ruta Coral al Cajon',
    sport: 'Ciclismo Ruta',
    schedule: 'Sabado · 08:30',
    location: 'Plaza San Enrique',
    organizer: 'Hive Leaders',
    participants: 12,
  },
];

export const safetyTips = [
  'Comparte tu llegada con una persona de confianza.',
  'Revisa el punto de encuentro antes de salir.',
  'Prefiere eventos con organizadoras y participantes verificadas.',
];
