export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'pt', label: 'Portuguese' },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: 'Pacific/Honolulu', label: '(-10:00) Hawaii' },
  { value: 'America/Anchorage', label: '(-09:00) Alaska' },
  { value: 'America/Los_Angeles', label: '(-08:00) Pacific Time (US & Canada)' },
  { value: 'America/Denver', label: '(-07:00) Mountain Time (US & Canada)' },
  { value: 'America/Chicago', label: '(-06:00) Central Time (US & Canada)' },
  { value: 'America/New_York', label: '(-04:00) Eastern Time (US & Canada)' },
  { value: 'America/Sao_Paulo', label: '(-03:00) Brasilia' },
  { value: 'Europe/London', label: '(+00:00) London' },
  { value: 'Europe/Paris', label: '(+01:00) Central European Time' },
  { value: 'Asia/Tokyo', label: '(+09:00) Tokyo' },
] as const;

export const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'JP', label: 'Japan' },
  { value: 'BR', label: 'Brazil' },
  { value: 'PH', label: 'Philippines' },
] as const;

export function languageLabel(value: string) {
  return LANGUAGE_OPTIONS.find((o) => o.value === value)?.label ?? 'English';
}

export function timezoneLabel(value: string) {
  return TIMEZONE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function countryLabel(value: string) {
  return COUNTRY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
