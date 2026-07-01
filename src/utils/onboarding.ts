export interface PhoneCountry {
  isoCode: string;
  dialCode: `+${number}`;
  exampleLocal: string;
  groupPattern: number[];
  maxDigits: number;
  minDigits: number;
  name: {
    en: string;
    es: string;
  };
  trunkPrefix?: string;
}

export const phoneCountries: PhoneCountry[] = [
  {
    isoCode: 'CL',
    dialCode: '+56',
    exampleLocal: '912345678',
    groupPattern: [1, 4, 4],
    maxDigits: 9,
    minDigits: 9,
    name: { en: 'Chile', es: 'Chile' },
  },
  {
    isoCode: 'AR',
    dialCode: '+54',
    exampleLocal: '91123456789',
    groupPattern: [2, 4, 4],
    maxDigits: 11,
    minDigits: 10,
    name: { en: 'Argentina', es: 'Argentina' },
    trunkPrefix: '0',
  },
  {
    isoCode: 'BO',
    dialCode: '+591',
    exampleLocal: '71234567',
    groupPattern: [3, 5],
    maxDigits: 8,
    minDigits: 8,
    name: { en: 'Bolivia', es: 'Bolivia' },
  },
  {
    isoCode: 'BR',
    dialCode: '+55',
    exampleLocal: '11987654321',
    groupPattern: [2, 5, 4],
    maxDigits: 11,
    minDigits: 10,
    name: { en: 'Brazil', es: 'Brasil' },
    trunkPrefix: '0',
  },
  {
    isoCode: 'CO',
    dialCode: '+57',
    exampleLocal: '3001234567',
    groupPattern: [3, 3, 4],
    maxDigits: 10,
    minDigits: 10,
    name: { en: 'Colombia', es: 'Colombia' },
  },
  {
    isoCode: 'EC',
    dialCode: '+593',
    exampleLocal: '991234567',
    groupPattern: [3, 3, 3],
    maxDigits: 9,
    minDigits: 9,
    name: { en: 'Ecuador', es: 'Ecuador' },
    trunkPrefix: '0',
  },
  {
    isoCode: 'MX',
    dialCode: '+52',
    exampleLocal: '5512345678',
    groupPattern: [2, 4, 4],
    maxDigits: 10,
    minDigits: 10,
    name: { en: 'Mexico', es: 'México' },
  },
  {
    isoCode: 'PE',
    dialCode: '+51',
    exampleLocal: '912345678',
    groupPattern: [3, 3, 3],
    maxDigits: 9,
    minDigits: 9,
    name: { en: 'Peru', es: 'Perú' },
  },
  {
    isoCode: 'PY',
    dialCode: '+595',
    exampleLocal: '981234567',
    groupPattern: [3, 3, 3],
    maxDigits: 9,
    minDigits: 9,
    name: { en: 'Paraguay', es: 'Paraguay' },
  },
  {
    isoCode: 'UY',
    dialCode: '+598',
    exampleLocal: '94234567',
    groupPattern: [2, 3, 3],
    maxDigits: 8,
    minDigits: 8,
    name: { en: 'Uruguay', es: 'Uruguay' },
  },
  {
    isoCode: 'US',
    dialCode: '+1',
    exampleLocal: '2025550147',
    groupPattern: [3, 3, 4],
    maxDigits: 10,
    minDigits: 10,
    name: { en: 'United States', es: 'Estados Unidos' },
  },
  {
    isoCode: 'CA',
    dialCode: '+1',
    exampleLocal: '4165550123',
    groupPattern: [3, 3, 4],
    maxDigits: 10,
    minDigits: 10,
    name: { en: 'Canada', es: 'Canadá' },
  },
  {
    isoCode: 'ES',
    dialCode: '+34',
    exampleLocal: '612345678',
    groupPattern: [3, 3, 3],
    maxDigits: 9,
    minDigits: 9,
    name: { en: 'Spain', es: 'España' },
  },
  {
    isoCode: 'FR',
    dialCode: '+33',
    exampleLocal: '612345678',
    groupPattern: [1, 2, 2, 2, 2],
    maxDigits: 9,
    minDigits: 9,
    name: { en: 'France', es: 'Francia' },
    trunkPrefix: '0',
  },
  {
    isoCode: 'DE',
    dialCode: '+49',
    exampleLocal: '15123456789',
    groupPattern: [3, 4, 4],
    maxDigits: 11,
    minDigits: 10,
    name: { en: 'Germany', es: 'Alemania' },
    trunkPrefix: '0',
  },
  {
    isoCode: 'GB',
    dialCode: '+44',
    exampleLocal: '7400123456',
    groupPattern: [4, 3, 3],
    maxDigits: 10,
    minDigits: 10,
    name: { en: 'United Kingdom', es: 'Reino Unido' },
    trunkPrefix: '0',
  },
  {
    isoCode: 'IT',
    dialCode: '+39',
    exampleLocal: '3123456789',
    groupPattern: [3, 3, 4],
    maxDigits: 10,
    minDigits: 9,
    name: { en: 'Italy', es: 'Italia' },
  },
  {
    isoCode: 'AU',
    dialCode: '+61',
    exampleLocal: '412345678',
    groupPattern: [3, 3, 3],
    maxDigits: 9,
    minDigits: 9,
    name: { en: 'Australia', es: 'Australia' },
    trunkPrefix: '0',
  },
  {
    isoCode: 'NZ',
    dialCode: '+64',
    exampleLocal: '211234567',
    groupPattern: [2, 3, 4],
    maxDigits: 9,
    minDigits: 8,
    name: { en: 'New Zealand', es: 'Nueva Zelanda' },
    trunkPrefix: '0',
  },
];

const phoneCountriesByDialCode = [...phoneCountries].sort(
  (left, right) => right.dialCode.length - left.dialCode.length,
);

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatDigitsWithPattern(digits: string, pattern: number[]) {
  if (!digits.length) {
    return '';
  }

  const chunks: string[] = [];
  let cursor = 0;

  for (const size of pattern) {
    if (cursor >= digits.length) {
      break;
    }

    const nextChunk = digits.slice(cursor, cursor + size);
    chunks.push(nextChunk);
    cursor += nextChunk.length;
  }

  if (cursor < digits.length) {
    chunks.push(digits.slice(cursor));
  }

  return chunks.join(' ');
}

function stripTrunkPrefix(digits: string, country: PhoneCountry) {
  if (
    country.trunkPrefix &&
    digits.startsWith(country.trunkPrefix) &&
    digits.length > country.minDigits
  ) {
    return digits.slice(country.trunkPrefix.length);
  }

  return digits;
}

function detectCountryFromDigits(value: string) {
  const normalizedDigits = onlyDigits(value).replace(/^00/, '');

  for (const country of phoneCountriesByDialCode) {
    const dialDigits = country.dialCode.slice(1);

    if (normalizedDigits.startsWith(dialDigits)) {
      return {
        country,
        localDigits: normalizedDigits.slice(dialDigits.length),
      };
    }
  }

  return null;
}

export function getPhoneCountryByIso(isoCode: string) {
  return phoneCountries.find((country) => country.isoCode === isoCode) ?? null;
}

export function detectPhoneCountry(phoneNumber: string) {
  return detectCountryFromDigits(phoneNumber)?.country ?? null;
}

export function getPhonePlaceholder(country: PhoneCountry) {
  return formatDigitsWithPattern(country.exampleLocal, country.groupPattern);
}

export function parsePhoneEntry(value: string, fallbackCountry: PhoneCountry) {
  const trimmedValue = value.trim();
  const digits = onlyDigits(value);

  if (!digits) {
    return {
      country: fallbackCountry,
      localNumber: '',
    };
  }

  const detected =
    trimmedValue.startsWith('+') ||
    trimmedValue.startsWith('00') ||
    digits.length > fallbackCountry.maxDigits
      ? detectCountryFromDigits(value)
      : null;

  const country = detected?.country ?? fallbackCountry;
  const localDigits = stripTrunkPrefix(
    detected?.localDigits ?? digits,
    country,
  ).slice(0, country.maxDigits);

  return {
    country,
    localNumber: formatDigitsWithPattern(localDigits, country.groupPattern),
  };
}

export function splitPhoneNumber(phoneNumber: string, fallbackCountry: PhoneCountry) {
  if (!phoneNumber.trim()) {
    return {
      country: fallbackCountry,
      localNumber: '',
    };
  }

  const detected = detectCountryFromDigits(phoneNumber);
  const country = detected?.country ?? fallbackCountry;
  const localDigits = stripTrunkPrefix(
    detected?.localDigits ?? onlyDigits(phoneNumber),
    country,
  ).slice(0, country.maxDigits);

  return {
    country,
    localNumber: formatDigitsWithPattern(localDigits, country.groupPattern),
  };
}

export function normalizePhoneNumber(value: string, country: PhoneCountry) {
  const digits = onlyDigits(value);

  if (!digits) {
    return null;
  }

  const strippedInternationalDigits = digits.replace(/^00/, '');
  const dialDigits = country.dialCode.slice(1);
  const localDigits = stripTrunkPrefix(
    strippedInternationalDigits.startsWith(dialDigits)
      ? strippedInternationalDigits.slice(dialDigits.length)
      : strippedInternationalDigits,
    country,
  );

  if (
    localDigits.length < country.minDigits ||
    localDigits.length > country.maxDigits
  ) {
    return null;
  }

  return `${country.dialCode}${localDigits}`;
}

export function formatBirthDateInput(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function birthDateInputToIso(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);

  if (year < 1900) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  const normalizedToday = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  if (date.getTime() > normalizedToday) {
    return null;
  }

  return `${yearValue}-${monthValue}-${dayValue}`;
}

export function isoBirthDateToInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return '';
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function maskPhoneNumber(phoneNumber: string) {
  const detectedCountry = detectPhoneCountry(phoneNumber);
  const digits = onlyDigits(phoneNumber);

  if (!digits.length) {
    return phoneNumber;
  }

  if (!detectedCountry) {
    return `+${digits.slice(0, 3)} •••• ${digits.slice(-4)}`;
  }

  const dialDigits = detectedCountry.dialCode.slice(1);
  const localDigits = digits.startsWith(dialDigits)
    ? digits.slice(dialDigits.length)
    : digits;
  const visiblePrefix = localDigits.slice(0, Math.min(2, localDigits.length));
  const visibleSuffix = localDigits.slice(-4);
  const hiddenCount = Math.max(
    localDigits.length - visiblePrefix.length - visibleSuffix.length,
    2,
  );

  return `${detectedCountry.dialCode} ${visiblePrefix} ${'•'.repeat(hiddenCount)} ${visibleSuffix}`.trim();
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
