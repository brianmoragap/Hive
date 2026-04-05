export function cleanRut(value: string) {
  return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatRut(value: string) {
  const cleaned = cleanRut(value);

  if (cleaned.length <= 1) {
    return cleaned;
  }

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${verifier}`;
}

export function isValidRut(value: string) {
  const cleaned = cleanRut(value);

  if (cleaned.length < 2) {
    return false;
  }

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const rest = 11 - (sum % 11);
  const expectedVerifier =
    rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);

  return verifier === expectedVerifier;
}

export function normalizeRut(value: string) {
  return formatRut(value);
}
