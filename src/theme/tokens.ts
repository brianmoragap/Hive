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

export const onboardingHeroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAaRnfYd41dZsPpnV5x49Ro8dL_A36kPNxX4VrdbmeG3pjs0lInn8eNhnU9H7opHT3jZSrZhEy1gDH998ZtBE0gD9okIdqnXGJDYMCaMP_jGkCroiXVd3lNypaa4U22q9VYLacOsDa9u-td1RT582Q4AslWJj5YfdA4pSnf1ZPP4ik1DLmcclSArIx6FT6gYmIZHuPVb6Jvx9ea_fErqzKEGm08RkWLQIPe3I7jyDctQPzkfQp65WkFdyMT-6P2mzXYrl3SEmVE3Z8';
export const homeSpotlightImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuARL8IMFe41XUY3kZlkPQ68VXTajL6Lxm7ikMbGzXNsDv17a7LXCjEuKlClcr1f1HobpbhRe6YcdQ5nYvPmsPwCHV7EcfAC2eWTiAWsNCzFmmmiu8p3x1NlKWruJlEf3M81J7i1J67-WfnoXWRQW3LiTqpYsEMeqswDmkrVjOgMv6VWESCeEdXDs5YjerJTN2wVvAP6KGKlmBG0vr4J4D8pWMePzgiPHN1rLltQAcDuuW2_E9B33NpsDqaunYMpc0HTCeT9fAIuYfk';
export const homeActivityAvatarImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA_T8HWCv5wXb2mce6y5pQ0DIPHEMgEcKqtgHRX7bxmMFfRv2ouoTXwbzabgj9IYwVcAZw2kfyCcjBaJxlZUyG6de6gy1bUf-rCelgcG7-IXoeYSlRSCxANynJ2h_I35rCvQaynRD2wXASexlNKXe1sWADGD6kT4M_zcmPjMJK9DAGoiZ6r5Y-w0vkLzv6QZlGBwSCa9t1DhObcWG3Lbglltz5NCO1Iaa1947bSwYOqvihdHY-34n22_3mXop4Wc1_yb6_MnMMI4WI';
export const createEventHeroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDo59SfSig96BM3hp5V2FGyg_lOgpPz6FpidEo_1uF2UDGtsDKL5Kh_cywnavCPlr_VBJz64-tqiW60IwO28qiHZa0GoGigs_a9-O5VwodtgcMnU5LwJGNwkY6n_fSCqlfRrHZIVXdCwN8naMXDQi4Y8G2pCU_WZ-bGRAzikV_TqU3qBWZAvu_vY_axTPCsBPdBbR_Qygsxgxhj6sT157uw4Q82VUqCVHs0gnJiYcZck0bAXrO_rZ-9ObbJaFUJwibqOeAOW6KEuII';
export const createEventMapImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeo2BooqbQzzz1V68fMsl-XiwYaFM8e1xvGcofFcUces2YFa8Ikwt1MAveVp5oVKjCmL1rGjoMOlN-8NrCKCun3BhLlsjeUeTx7db864lvKOyA9Ln4I95p6XABrwejznultDn92TQXs8QmDqiw5a1N1xPINr1fztP2Sk4uVOxqrlSqXF3JvUXKWqYJWrLHyedAZ4BlmE2eOx86H2ZvSIVDJ6zPmxKMm76oLe0srXJZ5IuxTGJDj33MU1iGGFDKrGCZMH2NA7eixR0';

export const sportHeroImages: Record<string, string> = {
  road_cycling:
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=85',
  mtb:
    'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&w=900&q=85',
  running:
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=900&q=85',
  trekking:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85',
  trail_running:
    'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=900&q=85',
  gym:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
};

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
    subtitle: 'Salidas técnicas con líderes verificadas',
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
    subtitle: 'Altimetría, apoyo mutuo y planes visibles',
    iconName: 'shoe-sneaker',
    accent: ['#FFD8C7', '#C56A45'],
  },
  {
    id: 'gym',
    label: 'Gym',
    subtitle: 'Rutinas de fuerza acompañadas y sin miradas',
    iconName: 'dumbbell',
    accent: ['#C7E3FF', '#2F6DA8'],
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
