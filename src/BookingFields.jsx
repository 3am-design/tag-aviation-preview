import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fullDateLabel, monthCells, monthLabel, monthStart, shiftDay, shiftMonth, shortDateLabel, toDate } from './calendar.js';
import './booking-fields.css';

function FieldIcon({ name }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === 'calendar' ? <><rect x="4" y="5" width="16" height="16" rx="1" /><path d="M8 3v4M16 3v4M4 10h16" /></> : name === 'people' ? <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2" /></> : name === 'close' ? <path d="m6 6 12 12M18 6 6 18" /> : name === 'minus' ? <path d="M5 12h14" /> : name === 'plus' ? <path d="M5 12h14M12 5v14" /> : <path d="m9 5 7 7-7 7" />}</svg>;
}

export function FloatingPanel({ anchor, onClose, children, className = '', width = 340, compactWidth = width, ...props }) {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const [position, setPosition] = useState({ opacity: 0, width, left: 0, top: 0 });
  const [side, setSide] = useState('above');
  useLayoutEffect(() => {
    const place = () => {
      if (!anchor.current || !panel.current) return;
      const viewport = window.visualViewport;
      const inset = 12, gap = 12;
      const viewLeft = viewport?.offsetLeft || 0, viewTop = viewport?.offsetTop || 0;
      const viewWidth = viewport?.width || window.innerWidth, viewHeight = viewport?.height || window.innerHeight;
      const rect = anchor.current.getBoundingClientRect();
      const panelWidth = Math.min(window.matchMedia('(max-width: 699px)').matches ? compactWidth : width, viewWidth - inset * 2);
      const above = Math.max(0, rect.top - viewTop - inset - gap);
      const below = Math.max(0, viewTop + viewHeight - rect.bottom - inset - gap);
      const height = panel.current.scrollHeight;
      const upwards = above >= height || (below < height && above >= below);
      const maxHeight = Math.max(80, Math.min(viewHeight - inset * 2, upwards ? above : below));
      const top = upwards ? rect.top - gap - Math.min(height, maxHeight) : rect.bottom + gap;
      setSide(upwards ? 'above' : 'below');
      setPosition({ opacity: 1, width: panelWidth, maxHeight, left: Math.max(viewLeft + inset, Math.min(rect.left, viewLeft + viewWidth - panelWidth - inset)), top: Math.max(viewTop + inset, Math.min(top, viewTop + viewHeight - Math.min(height, maxHeight) - inset)) });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(panel.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => { observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); window.visualViewport?.removeEventListener('resize', place); window.visualViewport?.removeEventListener('scroll', place); };
  }, [anchor, width, compactWidth]);
  useLayoutEffect(() => {
    const element = panel.current;
    if (!element?.contains(document.activeElement)) return;
    const bounds = element.getBoundingClientRect();
    const focus = document.activeElement.getBoundingClientRect();
    if (focus.top < bounds.top + 8) element.scrollTop -= bounds.top + 8 - focus.top;
    else if (focus.bottom > bounds.bottom - 8) element.scrollTop += focus.bottom - bounds.bottom + 8;
  }, [position]);
  useEffect(() => {
    const outside = event => { if (!panel.current?.contains(event.target) && !anchor.current?.contains(event.target)) close.current(); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); };
  }, [anchor]);
  return createPortal(<div {...props} ref={panel} style={position} data-placement={side} className={`booking-popover ${className}`} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(true); }
    if (event.key === 'Tab' && props.role === 'dialog') {
      const controls = [...panel.current.querySelectorAll('button:not(:disabled), [href], input:not(:disabled)')].filter(element => element.tabIndex >= 0);
      if ((!event.shiftKey && event.target === controls.at(-1)) || (event.shiftKey && event.target === controls[0])) {
        event.preventDefault();
        close.current(true);
      }
    }
  }}>{children}</div>, document.body);
}

function Calendar({ value, minimum, onSelect, onClose, label }) {
  const initial = value && value >= minimum ? value : minimum;
  const [month, setMonth] = useState(monthStart(initial));
  const [focused, setFocused] = useState(initial);
  const [single, setSingle] = useState(() => window.matchMedia('(max-width: 699px)').matches);
  const grid = useRef(null), focusDay = useRef(true);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 699px)');
    const resize = () => { setSingle(media.matches); if (media.matches) setMonth(current => monthStart(focused) !== current ? monthStart(focused) : current); };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, [focused]);
  useLayoutEffect(() => { if (focusDay.current) grid.current?.querySelector(`[data-date="${focused}"]`)?.focus({ preventScroll: true }); focusDay.current = false; }, [focused, month]);
  const count = single ? 1 : 2;
  const reveal = date => {
    focusDay.current = true;
    const next = date < minimum ? minimum : date;
    if (next < month || monthStart(next) > shiftMonth(month, count - 1)) setMonth(monthStart(next));
    setFocused(next);
  };
  const onDayKey = (event, date) => {
    let next;
    const weekday = toDate(date).getUTCDay();
    if (event.key === 'ArrowLeft') next = shiftDay(date, -1);
    if (event.key === 'ArrowRight') next = shiftDay(date, 1);
    if (event.key === 'ArrowUp') next = shiftDay(date, -7);
    if (event.key === 'ArrowDown') next = shiftDay(date, 7);
    if (event.key === 'Home') next = shiftDay(date, -weekday);
    if (event.key === 'End') next = shiftDay(date, 6 - weekday);
    if (event.key === 'PageUp') next = shiftMonth(date, event.shiftKey ? -12 : -1);
    if (event.key === 'PageDown') next = shiftMonth(date, event.shiftKey ? 12 : 1);
    if (next) { event.preventDefault(); reveal(next); }
  };
  const browse = delta => {
    focusDay.current = false;
    const next = shiftMonth(month, delta);
    setMonth(next);
    // Keep a reachable day in the visible month without moving focus off the arrow.
    setFocused(current => current >= next && monthStart(current) <= shiftMonth(next, count - 1) ? current : next < minimum ? minimum : next);
  };
  return <div className={`calendar ${single ? 'calendar-single' : ''}`} ref={grid}>
    <div className="popover-heading"><span>{label}</span><button type="button" className="popover-close" aria-label="Close calendar" onClick={() => onClose(true)}><FieldIcon name="close" /></button></div>
    <div className="calendar-navigation"><button type="button" className="calendar-prev" aria-label="Previous month" disabled={month <= monthStart(minimum)} onClick={() => browse(-1)}><FieldIcon /></button><span className="sr-only" aria-live="polite">{monthLabel(month)}{!single && ` and ${monthLabel(shiftMonth(month, 1))}`}</span><button type="button" aria-label="Next month" onClick={() => browse(1)}><FieldIcon /></button></div>
    <div className="calendar-months">{Array.from({ length: count }, (_, i) => {
      const current = shiftMonth(month, i);
      const cells = monthCells(current);
      return <section className="calendar-month" key={current} aria-label={monthLabel(current)}><h3>{monthLabel(current)}</h3><table role="grid" aria-label={monthLabel(current)}><thead><tr>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <th key={day} scope="col"><abbr title={{ Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' }[day]}>{day}</abbr></th>)}</tr></thead><tbody>{Array.from({ length: 6 }, (_, week) => <tr key={week}>{cells.slice(week * 7, week * 7 + 7).map((date, d) => <td key={d} aria-selected={date ? date === value : undefined}>{date && <button type="button" data-date={date} aria-label={fullDateLabel(date)} tabIndex={date === focused ? 0 : -1} disabled={date < minimum} className={date === value ? 'selected' : ''} onFocus={() => setFocused(date)} onKeyDown={e => onDayKey(e, date)} onClick={() => onSelect(date)}>{Number(date.slice(-2))}</button>}</td>)}</tr>)}</tbody></table></section>;
    })}</div>
  </div>;
}

export function DateField({ label = 'Departure date', value, onChange, min, compact = false }) {
  const id = useId(), anchor = useRef(null), trigger = useRef(null);
  const [open, setOpen] = useState(false);
  const close = returnFocus => { if (returnFocus) trigger.current?.focus({ preventScroll: true }); setOpen(false); };
  return <div ref={anchor} className={`date-field custom-date-field ${compact ? 'compact-field' : ''}`}><label htmlFor={id}>{label}</label><button id={id} type="button" ref={trigger} className={`field-trigger ${value ? '' : 'field-empty'}`} aria-label={label} aria-describedby={`${id}-value`} aria-expanded={open} aria-haspopup="dialog" aria-controls={open ? `${id}-calendar` : undefined} onClick={() => setOpen(!open)}><FieldIcon name="calendar" /><span id={`${id}-value`}>{value ? shortDateLabel(value) : 'Select date'}</span></button>{open && <FloatingPanel anchor={anchor} onClose={close} width={680} compactWidth={380} className="calendar-popover" role="dialog" aria-label={`Choose ${label.toLowerCase()}`} id={`${id}-calendar`}><Calendar value={value} minimum={min} label={label} onClose={close} onSelect={date => { onChange(date); close(true); }} /></FloatingPanel>}</div>;
}

export function GuestField({ value, onChange }) {
  const id = useId(), anchor = useRef(null), trigger = useRef(null);
  const [open, setOpen] = useState(false);
  const close = returnFocus => { if (returnFocus) trigger.current?.focus({ preventScroll: true }); setOpen(false); };
  return <div className="passenger-field" ref={anchor}><label htmlFor={id}>GUESTS</label><button ref={trigger} id={id} className="field-trigger" type="button" aria-label="Number of guests" aria-describedby={`${id}-value`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? `${id}-guests` : undefined} onClick={() => setOpen(!open)}><FieldIcon name="people" /><span id={`${id}-value`}>{value}</span></button>{open && <FloatingPanel anchor={anchor} onClose={close} width={330} className="guest-popover" role="dialog" aria-label="Choose number of guests" id={`${id}-guests`}><div className="popover-heading"><span>Your guests</span><button type="button" className="popover-close" autoFocus aria-label="Close guest selector" onClick={() => close(true)}><FieldIcon name="close" /></button></div><div className="guest-picker"><span>Passengers</span><div><button type="button" aria-label="Remove one guest" disabled={value <= 1} onClick={() => onChange(value - 1)}><FieldIcon name="minus" /></button><output aria-live="polite">{value}</output><button type="button" aria-label="Add one guest" disabled={value >= 30} onClick={() => onChange(value + 1)}><FieldIcon name="plus" /></button></div></div><button type="button" className="popover-done" onClick={() => close(true)}>Done</button></FloatingPanel>}</div>;
}
