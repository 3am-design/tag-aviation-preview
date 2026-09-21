export const optionOnePages = [
  { key: 'home', number: '01', label: 'Homepage', description: 'Brand introduction and flight-planning entry point.' },
  { key: 'plan', number: '02', label: 'Plan your flight', description: 'Route, dates, guests and aircraft preferences.' },
  { key: 'enquiry', number: '03', label: 'Your enquiry', description: 'Contact details, journey summary and confirmation.' },
];

export function previewPath(page, option = 1) {
  return `#/option-${option}/${page}`;
}

export function readPreviewRoute(hash = location.hash) {
  const route = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (!route) return { option: null, page: 'index' };
  if (route === 'plan' || route === 'enquiry') return { option: 1, page: route };
  const match = /^option-(1|2)\/(home|plan|enquiry)$/.exec(route);
  if (match) return { option: Number(match[1]), page: match[2] };
  return { option: null, page: 'not-found' };
}
