export const previewPages = [
  { key: 'home', label: 'Homepage' },
  { key: 'plan', label: 'Plan your flight – Your journey' },
  { key: 'enquiry', label: 'Plan your flight – Your details' },
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
