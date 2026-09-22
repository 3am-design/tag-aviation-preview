import OptionTwo from './OptionTwo.jsx';
import React, { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import PreviewIndex from './PreviewIndex.jsx';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';
import { useEditorialMotion } from './editorial-motion.js';
import { DateField, GuestField, FloatingPanel } from './BookingFields.jsx';
import { readPreviewRoute, previewPath } from './preview-routes.js';
import './refinements.css';

const A = `${import.meta.env.BASE_URL}assets/`;
const images = { logo: '74f2e2ff4c71dadb.svg', hero: '58dd90f02981a233.webp', cabin: 'bf62b8a96dbd4bc9.webp', dining: 'ec4a8f842b1834ed.webp', management: 'a51bc19123bfa317.webp', concierge: 'fd1ce363b76b5a85.webp' };
const airports = [
  { city: 'Hong Kong', airport: 'Hong Kong International', code: 'HKG', region: 'Hong Kong' },
  { city: 'London', airport: 'Farnborough', code: 'FAB', region: 'United Kingdom' },
  { city: 'Tokyo', airport: 'Haneda', code: 'HND', region: 'Japan' },
  { city: 'Singapore', airport: 'Seletar', code: 'XSP', region: 'Singapore' },
  { city: 'Geneva', airport: 'Geneva International', code: 'GVA', region: 'Switzerland' },
  { city: 'Paris', airport: 'Le Bourget', code: 'LBG', region: 'France' },
  { city: 'Dubai', airport: 'Al Maktoum International', code: 'DWC', region: 'UAE' },
  { city: 'New York', airport: 'Teterboro', code: 'TEB', region: 'United States' },
  { city: 'Nice', airport: 'Côte d’Azur', code: 'NCE', region: 'France' },
  { city: 'Malé', airport: 'Velana International', code: 'MLE', region: 'Maldives' },
  { city: 'Macau', airport: 'Macau International', code: 'MFM', region: 'Macau' },
];
const fullAirport = a => `${a.city} (${a.code})`;
const resolveAirport = value => airports.find(a => fullAirport(a) === value);
const cityName = value => resolveAirport(value)?.city || value || 'Your destination';
const airportCode = value => resolveAirport(value)?.code || '—';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const future = days => { const d = new Date(`${today()}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
const dateLabel = value => value ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Date to be confirmed';
const initialJourney = { type: 'one-way', passengers: 2, legs: [{ from: 'Hong Kong (HKG)', to: 'London (FAB)', date: future(6), time: '10:00' }], returnDate: '', returnTime: '10:00', cabin: 'Let TAG advise', flexibility: false };
function exampleJourney() {
  return { ...initialJourney, legs: [{ from: 'Hong Kong (HKG)', to: 'London (FAB)', date: future(6), time: '10:00' }] };
}
function readJourney() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('tag-demo-journey-v2'));
    if (saved && ['one-way', 'round-trip', 'multi-city'].includes(saved.type) && Number.isInteger(saved.passengers) && saved.passengers >= 1 && saved.passengers <= 30 && Array.isArray(saved.legs) && saved.legs.length >= 1 && saved.legs.length <= 4 && saved.legs.every(l => l && ['from', 'to', 'date', 'time'].every(k => typeof l[k] === 'string')) && ['returnDate', 'returnTime', 'cabin'].every(k => typeof saved[k] === 'string')) return { ...initialJourney, ...saved };
  } catch { /* Private browsing can make storage unavailable. */ }
  return initialJourney;
}
const teams = { asia: { label: 'Charter Asia', location: 'Hong Kong', email: 'charter.asia@tagaviation.com', phone: '+852 3141 2027', tel: '+85231412027' }, europe: { label: 'Charter Europe', location: 'Farnborough', email: 'charter.europe@tagaviation.com', phone: '+44 1252 377 977', tel: '+441252377977' } };
function Icon({ name = 'arrow', size = 20, ...props }) {
  const directional = name === 'arrow' || name === 'upRight';
  const paths = {
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>, upRight: <><path d="M5 19 19 5M5 5h14v14" /></>, chevron: <path d="m6 9 6 6 6-6" />,
    plane: <path d="m22 2-7 20-4-9-9-4 20-7ZM11 13l5-5" />, swap: <><path d="M4 7h16l-4-4M20 17H4l4 4" /></>, plus: <path d="M12 5v14M5 12h14" />, minus: <path d="M5 12h14" />, close: <path d="m5 5 14 14M19 5 5 19" />,
    check: <path d="m5 12 4 4L19 6" />, lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>, phone: <path d="M8 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-4l-5-2-2 2a14 14 0 0 1-6-6l2-2-2-5Z" />,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>, menu: <><path d="M4 8h16M4 16h16" /></>, pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>, calendar: <><rect x="4" y="5" width="16" height="16" rx="1" /><path d="M8 3v4M16 3v4M4 10h16" /></>, people: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2" /></>,
  };
  return <svg className={directional ? 'tag-action-arrow' : undefined} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{directional ? paths.arrow : paths[name] || paths.arrow}</svg>;
}
function AirportField({ label, value, onChange, required = true }) {
  const id = useId(); const anchor = useRef(null); const input = useRef(null); const [open, setOpen] = useState(false); const [active, setActive] = useState(-1);
  const query = resolveAirport(value) ? '' : value.toLowerCase();
  const matches = airports.filter(a => `${a.city} ${a.airport} ${a.code} ${a.region}`.toLowerCase().includes(query)).slice(0, 5);
  function select(a) { onChange(fullAirport(a)); input.current?.focus({ preventScroll: true }); setOpen(false); setActive(-1); }
  return <div className="airport-field" ref={anchor}>
    <label htmlFor={id}>{label}</label>
    <div className="input-icon"><Icon name="plane" size={18} /><input ref={input} id={id} role="combobox" aria-expanded={open} aria-controls={`${id}-options`} aria-autocomplete="list" aria-activedescendant={open && active >= 0 && matches[active] ? `${id}-${active}` : undefined} placeholder="City or airport" value={value} required={required} maxLength={100} autoComplete="off" onFocus={() => { setOpen(true); setActive(-1); }} onInput={e => { onChange(e.target.value); setOpen(true); setActive(-1); }} onKeyDown={e => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, matches.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setActive(i => i < 0 ? matches.length - 1 : Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && open && active >= 0 && matches[active]) { e.preventDefault(); select(matches[active]); }
    }} /></div>
    {open && <FloatingPanel anchor={anchor} onClose={returnFocus => { if (returnFocus) input.current?.focus({ preventScroll: true }); setOpen(false); }} width={360} className="airport-popover" id={`${id}-options`} role="listbox" aria-label={`${label} suggestions`}><span className="popover-label">{query ? 'Matching destinations' : 'Popular destinations'}</span>{matches.map((a, i) => <button type="button" role="option" aria-selected={active === i} id={`${id}-${i}`} key={a.code} className={active === i ? 'active' : ''} tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => select(a)}><span><strong>{a.city}</strong><small>{a.airport}</small></span><b>{a.code}</b></button>)}{!matches.length && <p className="no-match">We can help with other destinations too. Continue with “{value}”.</p>}</FloatingPanel>}
  </div>;
}
function TripTypes({ value, onChange }) {
  return <div className="trip-types" role="group" aria-label="Journey type">{[['one-way', 'One way'], ['round-trip', 'Round trip'], ['multi-city', 'Multi-city']].map(([v, l]) => <button type="button" key={v} aria-pressed={value === v} className={value === v ? 'selected' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}
function JourneySummary({ journey, edit, compact = false }) {
  const legs = journey.type === 'multi-city' ? journey.legs : [journey.legs[0]];
  return <div className={`journey-summary ${compact ? 'compact' : ''}`}>
    <div className="summary-title"><span className="eyebrow">YOUR JOURNEY</span>{edit && <button className="text-button" onClick={edit}>Edit <Icon size={14} /></button>}</div>
    {legs.map((leg, i) => <div className="route-summary" key={i}><div className="route-codes"><div><strong>{airportCode(leg.from)}</strong><span>{cityName(leg.from)}</span></div><div className="route-line"><Icon name="plane" size={22} /></div><div><strong>{airportCode(leg.to)}</strong><span>{cityName(leg.to)}</span></div></div><div className="route-date"><span>{journey.type === 'multi-city' ? `Flight ${i + 1} · ` : ''}{dateLabel(leg.date)}</span><span>{leg.time} local</span></div></div>)}
    <dl className="summary-details"><div><dt>Journey</dt><dd>{{ 'one-way': 'One way', 'round-trip': 'Round trip', 'multi-city': 'Multi-city' }[journey.type]}</dd></div>{journey.type === 'round-trip' && <div><dt>Return</dt><dd>{dateLabel(journey.returnDate)} · {journey.returnTime}</dd></div>}<div><dt>Passengers</dt><dd>{journey.passengers} {journey.passengers === 1 ? 'guest' : 'guests'}</dd></div><div><dt>Aircraft preference</dt><dd>{journey.cabin}</dd></div>{journey.flexibility && <div><dt>Dates</dt><dd>Flexible by one day</dd></div>}</dl>
  </div>;
}
function validateJourney(journey) {
  if (!Number.isInteger(journey.passengers) || journey.passengers < 1 || journey.passengers > 30) return 'Please enter between 1 and 30 guests.';
  if (journey.type === 'multi-city' && journey.legs.length < 2) return 'Please add at least two flights for a multi-city journey.';
  const legs = journey.type === 'multi-city' ? journey.legs : [journey.legs[0]];
  for (const [i, leg] of legs.entries()) {
    if (!leg.from.trim() || !leg.to.trim() || !leg.date) return `Please complete the route and departure date for flight ${i + 1}.`;
    if (leg.from.trim().toLowerCase() === leg.to.trim().toLowerCase()) return `Choose different departure and arrival locations for flight ${i + 1}.`;
    if (leg.date < today()) return 'Please choose a departure date from today onwards.';
    if (i > 0 && leg.date < legs[i - 1].date) return 'Please arrange your flights in date order.';
  }
  if (journey.type === 'round-trip' && (!journey.returnDate || journey.returnDate < legs[0].date)) return 'Please choose a return date on or after your departure.';
  return '';
}

function App() {
  const routeFromHash = () => readPreviewRoute().page;
  const [page, setPage] = useState(routeFromHash);
  const [journey, setJourney] = useState(() => { const saved = readJourney(); return routeFromHash() === 'enquiry' && validateJourney(saved) ? exampleJourney() : saved; });
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '', team: 'asia', notes: '', consent: false });
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);
  useEditorialMotion(page, completed);
  useEffect(() => { try { sessionStorage.setItem('tag-demo-journey-v2', JSON.stringify(journey)); } catch { /* The flow still works without storage. */ } }, [journey]);
  useEffect(() => { if (page === 'enquiry' && validateJourney(journey)) setJourney(exampleJourney()); }, [page]);
  useEffect(() => { const change = () => { setPage(routeFromHash()); if (routeFromHash() !== 'enquiry') setCompleted(false); setError(''); window.scrollTo({ top: 0, behavior: 'instant' }); }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  useEffect(() => { document.title = `${page === 'home' ? 'A world of your own' : page === 'plan' ? 'Plan your flight' : completed ? 'Enquiry preview complete' : 'Your enquiry'} — TAG Aviation`; if (page !== 'home') document.querySelector('h1')?.focus({ preventScroll: true }); }, [page, completed]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const go = p => { setError(''); if (p !== 'enquiry') setCompleted(false); if (page === p) window.scrollTo({ top: 0, behavior: 'smooth' }); else location.hash = previewPath(p); };
  const updateLeg = (index, key, value) => { setJourney(j => ({ ...j, legs: j.legs.map((l, i) => i === index ? { ...l, [key]: value } : l) })); setError(''); setCompleted(false); };
  const patchJourney = patch => { setJourney(j => ({ ...j, ...patch })); setError(''); setCompleted(false); };
  const swap = index => setJourney(j => ({ ...j, legs: j.legs.map((l, i) => i === index ? { ...l, from: l.to, to: l.from } : l) }));
  const changeType = type => setJourney(j => ({ ...j, type, legs: type === 'multi-city' && j.legs.length === 1 ? [...j.legs, { from: j.legs[0].to, to: '', date: '', time: '10:00' }] : j.legs }));
  const start = event => { event.preventDefault(); setCompleted(false); go('plan'); };
  const next = event => { event.preventDefault(); const err = validateJourney(journey); if (err) { setError(err); return; } const origin = resolveAirport(journey.legs[0].from); if (origin && ['United Kingdom', 'Switzerland', 'France'].includes(origin.region)) setContact(c => ({ ...c, team: 'europe' })); setCompleted(false); go('enquiry'); };
  const submit = event => { event.preventDefault(); const err = validateJourney(journey); if (err) { setError('Your journey is incomplete. Please edit your flight details before continuing.'); return; } if (!contact.firstName.trim() || !contact.lastName.trim()) { setError('Please enter your first and last name.'); return; } setCompleted(true); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const updateContact = (key, value) => setContact(c => ({ ...c, [key]: value }));
  const team = teams[contact.team];
  const stepper = <ol className="steps" aria-label="Enquiry progress"><li className={page === 'plan' ? 'current' : 'done'} aria-current={page === 'plan' ? 'step' : undefined}><span>{page === 'plan' ? '01' : <Icon name="check" size={15} />}</span><button onClick={() => go('plan')}>Your journey</button></li><li className={page === 'enquiry' && !completed ? 'current' : completed ? 'done' : ''} aria-current={page === 'enquiry' && !completed ? 'step' : undefined}><span>{completed ? <Icon name="check" size={15} /> : '02'}</span>Your details</li><li className={completed ? 'current' : ''} aria-current={completed ? 'step' : undefined}><span>03</span>Confirmation</li></ol>;
  const errorBox = error && <div className="error-box" role="alert" ref={errorRef} tabIndex={-1}>{error}</div>;
  return <>
    <a href="#main" className="skip-link" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
    <div className="utility-bar" data-tag-intro="utility">
      <span data-tag-intro-item>SWISS HERITAGE. GLOBAL PERSPECTIVE.</span>
      <div className="utility-contacts" data-tag-intro-item>
        <div className="utility-office"><button className="utility-location" type="button" disabled><Icon name="pin" size={13} />Hong Kong<Icon name="chevron" size={11} /></button><a role="link" aria-disabled="true">+852 3141 2027</a></div>
        <div className="utility-links"><a className="utility-news" role="link" aria-disabled="true">News</a><span className="language"><Icon name="globe" size={13} /> EN</span></div>
      </div>
    </div>
    <SiteHeader logo={A + images.logo} page={page} onPlan={() => go('plan')} />
    <main id="main" tabIndex={-1}>
    {page === 'home' ? <>
      <section className="hero" data-tag-intro="hero" aria-labelledby="hero-heading"><div className="hero-visual"><img className="hero-image" src={A + images.hero} alt="Guests boarding a private jet with TAG Aviation" fetchPriority="high" /><div className="hero-shade" /></div><div className="hero-copy wrap"><p data-tag-intro-item className="eyebrow light"><span className="red-line" />EXCEPTIONAL JOURNEYS. PERSONALLY YOURS.</p><h1 id="hero-heading"><span className="hero-line" data-tag-intro-item>A world</span><span className="hero-line" data-tag-intro-item>of your <em>own.</em></span></h1><p data-tag-intro-item>Your time. Your destination. Every detail considered.<br className="desktop-br" /> Private aviation, with the personal touch of TAG.</p><button className="hero-link" data-tag-intro-item disabled>Discover the TAG difference <span className="circle-arrow"><Icon name="arrow" size={19} /></span></button></div></section>
      <section className="booking-section wrap" data-tag-reveal="booking" aria-label="Start planning your flight"><form className="quick-booking" onSubmit={start}><div className="booking-top"><h2>Where can we take you?</h2><TripTypes value={journey.type} onChange={changeType} /></div><div className="quick-fields"><AirportField label="DEPARTING FROM" value={journey.legs[0].from} onChange={v => updateLeg(0, 'from', v)} required={false} /><button type="button" className="swap-button" aria-label="Swap departure and destination" onClick={() => swap(0)}><Icon name="swap" size={17} /></button><AirportField label="FLYING TO" value={journey.legs[0].to} onChange={v => updateLeg(0, 'to', v)} required={false} /><DateField label="Departure date" compact value={journey.legs[0].date} min={today()} onChange={v => updateLeg(0, 'date', v)} /><GuestField value={journey.passengers} onChange={v => patchJourney({ passengers: v })} /><button className="button primary quick-submit" type="submit">Plan my flight <Icon name="arrow" size={19} /></button></div></form></section>
      <section className="heritage wrap" data-tag-sequence id="why-tag"><div className="heritage-intro" data-tag-reveal="copy"><p className="eyebrow">THE TAG DIFFERENCE</p><h2>Extraordinary comes<br />from <em>experience.</em></h2></div><div className="heritage-copy" data-tag-reveal="copy"><p>There is a quiet confidence that comes with six decades in private aviation. The freedom to go where you choose. The reassurance that every detail is in experienced hands.</p><a className="text-link" role="link" aria-disabled="true">Get to know TAG <Icon name="upRight" size={17} /></a></div><div className="heritage-number" data-tag-reveal="copy"><strong>60<span>YEARS</span></strong><span>Swiss precision.<br />A personal approach.</span></div></section>
      <section className="expertise wrap" data-tag-sequence id="expertise"><div className="section-heading" data-tag-reveal="copy"><div><p className="eyebrow">A COMPLETE WORLD OF AVIATION</p><h2>Whatever brings you <em>here.</em></h2></div><p>One trusted partner.<br />Expertise at every altitude.</p></div><div className="service-grid"><button className="service-card charter-card" data-tag-reveal disabled><img src={A + images.cabin} alt="A peaceful cabin on a TAG private aircraft" loading="lazy" /><div className="service-copy"><span className="eyebrow light">FOR YOUR NEXT JOURNEY</span><h3>Private charter</h3><span>Fly on your terms <Icon name="upRight" /></span></div></button><a className="service-card" data-tag-reveal role="link" aria-disabled="true"><img src={A + images.management} alt="A private jet in an aircraft hangar" loading="lazy" /><div className="service-copy"><span className="eyebrow light">FOR AIRCRAFT OWNERS</span><h3>Aircraft management</h3><span>Your aircraft. Our expertise. <Icon name="upRight" /></span></div></a></div><div className="service-links" data-tag-reveal><a role="link" aria-disabled="true"><span>01</span><div><strong>Maintenance</strong><small>Precision on the ground</small></div><Icon name="upRight" /></a><a role="link" aria-disabled="true"><span>02</span><div><strong>FBO handling</strong><small>A seamless arrival</small></div><Icon name="upRight" /></a><a role="link" aria-disabled="true"><span>03</span><div><strong>Global training</strong><small>Excellence, shared</small></div><Icon name="upRight" /></a></div></section>
      <section className="experience-band" data-tag-sequence><div className="experience-image" data-tag-reveal="media"><img src={A + images.dining} alt="Personal service and dining on board a TAG aircraft" loading="lazy" /></div><div className="experience-copy" data-tag-reveal="copy"><p className="eyebrow light">THE ART OF FLYING WELL</p><h2>More than a flight.<br /><em>Your way of life.</em></h2><p>A familiar welcome. A table set just for you. Space to switch off, or think ahead. We shape the journey around what matters to you.</p><button className="button outline-light" disabled>Begin your journey <Icon name="arrow" size={18} /></button><span className="experience-signature">PERSONAL, BY NATURE.</span></div></section>
      <section className="home-contact wrap" data-tag-sequence><div data-tag-reveal="copy"><p className="eyebrow">LET’S MAKE IT PERSONAL</p><h2>Your next chapter<br />starts with <em>a conversation.</em></h2></div><div data-tag-reveal="copy"><span className="eyebrow">YOUR CHARTER TEAM IN ASIA</span><a className="contact-number"  role="link" aria-disabled="true">+852 3141 2027</a><a className="text-link"  role="link" aria-disabled="true">charter.asia@tagaviation.com <Icon name="upRight" size={16} /></a><button className="text-button other-team" disabled>Looking for another service? <Icon name="arrow" size={16} /></button></div></section>
    </> : <div className="flow-page">
      {page === 'plan' ? <>
        <section className="flow-intro wrap" data-tag-intro="page"><p className="eyebrow" data-tag-intro-item>PRIVATE CHARTER</p><h1 tabIndex={-1} data-tag-intro-item>Your journey. <em>Your rules.</em></h1><div className="flow-intro-summary" data-tag-intro-item><p>Tell us where you would like to go. We’ll take care of the possibilities.</p>{stepper}</div></section>
        <div className="flow-grid plan-grid wrap" data-tag-sequence><form data-tag-reveal="panel" className="journey-form" onSubmit={next}><div className="form-panel"><div className="panel-heading"><h2>Let’s plan your flight</h2><span>01 — YOUR JOURNEY</span></div><TripTypes value={journey.type} onChange={changeType} />{(journey.type === 'multi-city' ? journey.legs : [journey.legs[0]]).map((leg, i) => <fieldset className="flight-leg" key={i}><legend>{journey.type === 'multi-city' ? `Flight ${String(i + 1).padStart(2, '0')}` : 'Flight details'}</legend>{journey.type === 'multi-city' && i > 0 && <button type="button" className="remove-leg" onClick={() => patchJourney({ legs: journey.legs.filter((_, k) => k !== i) })}>Remove <Icon name="close" size={13} /></button>}<div className="route-fields"><AirportField label={`Departing from${i ? ` · Flight ${i + 1}` : ''}`} value={leg.from} onChange={v => updateLeg(i, 'from', v)} /><button type="button" className="swap-button" aria-label={`Swap route for flight ${i + 1}`} onClick={() => swap(i)}><Icon name="swap" size={18} /></button><AirportField label={`Flying to${i ? ` · Flight ${i + 1}` : ''}`} value={leg.to} onChange={v => updateLeg(i, 'to', v)} /></div><div className="two-fields"><DateField label={`Departure date${i > 0 ? ` · Flight ${i + 1}` : ''}`} min={i ? journey.legs[i - 1].date || today() : today()} value={leg.date} onChange={v => updateLeg(i, 'date', v)} /><label>Preferred departure time{ i > 0 ? ` · Flight ${i + 1}` : ''}<input type="time" required value={leg.time} onInput={e => updateLeg(i, 'time', e.target.value)} /><span className="field-hint">Local time at departure</span></label></div></fieldset>)}{journey.type === 'round-trip' && <div className="two-fields return-fields"><DateField label="Return date" min={journey.legs[0].date || today()} value={journey.returnDate} onChange={v => patchJourney({ returnDate: v })} /><label>Preferred return time<input type="time" required value={journey.returnTime} onInput={e => patchJourney({ returnTime: e.target.value })} /><span className="field-hint">Local time at return departure</span></label></div>}{journey.type === 'multi-city' && journey.legs.length < 4 && <button type="button" className="add-flight" onClick={() => patchJourney({ legs: [...journey.legs, { from: journey.legs.at(-1).to, to: '', date: '', time: '10:00' }] })}><Icon name="plus" size={17} />Add another flight</button>}<label className="check-row"><input type="checkbox" checked={journey.flexibility} onChange={e => patchJourney({ flexibility: e.target.checked })} /><span>My dates are flexible by one day</span></label><div className="form-divider" /><div className="two-fields guest-preferences"><div><label htmlFor="passengers">Number of guests</label><div className="passenger-stepper"><button type="button" disabled={journey.passengers <= 1} aria-label="Remove one guest" onClick={() => patchJourney({ passengers: journey.passengers - 1 })}><Icon name="minus" size={16} /></button><input id="passengers" aria-label="Number of guests" type="number" min="1" max="30" required value={journey.passengers} onChange={e => patchJourney({ passengers: e.target.value === '' ? '' : +e.target.value })} /><button type="button" disabled={journey.passengers >= 30} aria-label="Add one guest" onClick={() => patchJourney({ passengers: +journey.passengers + 1 })}><Icon name="plus" size={16} /></button></div></div><label>Aircraft preference <span className="optional">(optional)</span><select value={journey.cabin} onChange={e => patchJourney({ cabin: e.target.value })}><option>Let TAG advise</option><option>Light jet</option><option>Midsize jet</option><option>Large cabin jet</option><option>Ultra-long-range jet</option></select></label></div>{errorBox}<div className="form-action"><span><Icon name="lock" size={15} />No commitment. No payment details.</span><button type="submit" className="button primary">Continue to your details <Icon name="arrow" size={18} /></button></div></div></form><p className="form-reassurance"><span>Every journey is individually arranged.</span> Aircraft availability and pricing will be confirmed in your personal proposal.</p>
        <aside className="plan-aside" data-tag-reveal="panel"><div className="aside-photo"><img src={A + images.cabin} alt="A calm and comfortable private cabin" /><span>A LITTLE CLOSER TO YOUR NEXT CHAPTER.</span></div><div className="aside-editorial"><p className="eyebrow">EFFORTLESS, FROM THE START</p><h2>You set the destination.<br /><em>We take it from here.</em></h2><ol className="next-steps"><li><span>01</span><div><strong>Share your plans</strong><p>A few details help us understand your journey.</p></div></li><li><span>02</span><div><strong>Receive a personal proposal</strong><p>Your charter specialist matches the aircraft to your needs.</p></div></li><li><span>03</span><div><strong>Make it yours</strong><p>Confirm your arrangements directly with your specialist.</p></div></li></ol></div><div className="aside-contact"><Icon name="phone" size={19} /><div><span>Prefer to talk?</span><a role="link" aria-disabled="true">+852 3141 2027</a></div><span className="tiny-label">CHARTER ASIA</span></div></aside></div>
      </> : completed ? <section className="confirmation wrap" data-tag-intro="page"><div className="confirmation-progress">{stepper}</div><div className="confirmation-mark"><Icon name="check" size={36} /></div><p className="eyebrow">YOUR ENQUIRY PREVIEW</p><h1 tabIndex={-1} data-tag-intro-item>The beginning of<br /><em>something exceptional.</em></h1><p>Thank you, {contact.firstName}. Your journey details are ready for {team.label}.</p><div className="demo-notice"><strong>Demo complete — no enquiry has been sent.</strong><span>In the live experience, your specialist would review your plans and contact you at {contact.email} with a tailored proposal.</span></div><div className="confirmation-grid"><JourneySummary journey={journey} compact /><div className="confirmation-team"><span className="eyebrow">YOUR DEDICATED TEAM</span><h2>{team.label}</h2><p>{team.location}</p><a role="link" aria-disabled="true">{team.email}</a><a role="link" aria-disabled="true">{team.phone}</a><div className="next-copy"><strong>What happens next?</strong><p>Your specialist confirms availability, presents suitable aircraft and discusses your preferences before any booking is agreed.</p></div></div></div><div className="confirmation-actions"><button className="button primary" onClick={() => go('home')}>Return to home <Icon name="arrow" size={18} /></button><button className="text-button" onClick={() => setCompleted(false)}>Review your details</button></div></section> : <>
        <section className="flow-intro wrap" data-tag-intro="page"><p className="eyebrow" data-tag-intro-item>A PERSONAL CONNECTION</p><h1 tabIndex={-1} data-tag-intro-item>Leave the details <em>to us.</em></h1><div className="flow-intro-summary" data-tag-intro-item><p>One dedicated charter team. A proposal shaped around you.</p>{stepper}</div></section><div className="flow-grid enquiry-grid wrap" data-tag-sequence><form data-tag-reveal="panel" className="enquiry-form" onSubmit={submit}><div className="form-panel"><div className="panel-heading"><h2>A little about you</h2><span>02 — YOUR DETAILS</span></div><p className="form-description">So your charter specialist can make it personal.<br />All fields are required unless marked optional.</p><div className="two-fields"><label>First name<input type="text" name="given-name" autoComplete="given-name" value={contact.firstName} maxLength={80} required onInput={e => updateContact('firstName', e.target.value)} placeholder="First name" /></label><label>Last name<input type="text" name="family-name" autoComplete="family-name" value={contact.lastName} maxLength={80} required onInput={e => updateContact('lastName', e.target.value)} placeholder="Last name" /></label></div><div className="two-fields"><label>Email address<input type="email" autoComplete="email" required value={contact.email} maxLength={160} onInput={e => updateContact('email', e.target.value)} placeholder="you@example.com" /></label><label>Phone number <span className="optional">(optional)</span><input type="tel" autoComplete="tel" value={contact.phone} maxLength={40} onInput={e => updateContact('phone', e.target.value)} placeholder="Include country code" /></label></div><label className="full-field">Your preferred charter team<select value={contact.team} onChange={e => updateContact('team', e.target.value)}><option value="asia">Asia · Hong Kong</option><option value="europe">Europe · Farnborough</option></select></label><label className="full-field">Make it personal <span className="optional">(optional)</span><textarea rows="3" maxLength={2000} value={contact.notes} onInput={e => updateContact('notes', e.target.value)} placeholder="Travelling with a pet, favourite dining, ground transfers, or anything else we should know…" /></label><div className="routing-note"><span className="routing-dot" /><div><strong>Your enquiry goes directly to {team.label}.</strong><span>{team.email}</span></div></div><label className="check-row consent"><input type="checkbox" required checked={contact.consent} onChange={e => updateContact('consent', e.target.checked)} /><span>I agree to TAG Aviation using my details to respond to this enquiry, in accordance with its <a role="link" aria-disabled="true">Privacy Policy</a>.</span></label>{errorBox}<button className="button primary submit-enquiry" type="submit">Request my proposal <Icon name="arrow" size={18} /></button></div></form><aside className="enquiry-aside" data-tag-reveal="panel"><JourneySummary journey={journey} edit={() => go('plan')} /><div className="personal-team"><img src={A + images.concierge} alt="A TAG team member wearing the signature silk scarf" /><div><p className="eyebrow">A REAL PERSON. YOUR PERSON.</p><h2>Expert hands.<br /><em>A personal touch.</em></h2><p>Your dedicated specialist will guide you from the first conversation to your final destination.</p><a role="link" aria-disabled="true"><Icon name="phone" size={16} />{team.phone}</a></div></div><div className="privacy-note"><Icon name="lock" size={17} /><span>Your privacy is part of our service. No payment required to enquire.</span></div></aside></div>
      </>}
    </div>}
    </main>
    <SiteFooter logo={A + images.logo} />
  </>;
}

function PreviewRoot() {
  const [route, setRoute] = useState(readPreviewRoute);
  useEffect(() => {
    const change = () => { setRoute(readPreviewRoute()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    if (!route.option) document.title = 'TAG Aviation — Design directions';
  }, [route]);
  return route.option === 1 ? <App /> : route.option === 2 ? <OptionTwo page={route.page} /> : <PreviewIndex notFound={route.page === 'not-found'} />;
}

createRoot(document.getElementById('root')).render(<PreviewRoot />);
