export const optionOnePages = [
  { key: 'home', number: '01', label: 'Homepage', description: 'Brand introduction and flight-planning entry point.' },
  { key: 'plan', number: '02', label: 'Plan your flight', description: 'Route, dates, guests and aircraft preferences.' },
  { key: 'enquiry', number: '03', label: 'Your enquiry', description: 'Contact details, journey summary and confirmation.' },
];

export function previewPath(page) {
  return `#/option-1/${page}`;
}

export function readPreviewRoute(hash = location.hash) {
  const route = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (!route) return { option: null, page: 'index' };
  if (route === 'plan' || route === 'enquiry') return { option: 1, page: route };
  const match = /^option-1\/(home|plan|enquiry)$/.exec(route);
  if (match) return { option: 1, page: match[1] };
  return { option: null, page: 'not-found' };
}
