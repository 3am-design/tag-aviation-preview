import React, { useEffect, useId, useRef, useState } from 'react';

const groups = [
  { title: 'Our expertise', wide: true, columns: [
    { title: 'Aircraft management', items: ['Aircraft management'] },
    { title: 'Maintenance', items: ['Aircraft maintenance', 'Type capabilities', 'Aircraft cleaning'] },
    { title: 'FBO handling', items: ['Passenger & crew facilities', 'Aircraft services', 'Handling information'] },
    { title: 'Global training', items: ['Ground courses', 'Training partners', 'Flight training'] },
  ] },
];
function Chevron() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
}
export default function SiteHeader({ logo, page, onPlan }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const header = useRef(null), mobileTrigger = useRef(null);
  const id = useId();
  useEffect(() => { setExpanded(null); setMobileOpen(false); }, [page]);
  useEffect(() => {
    const outside = event => { if (!header.current?.contains(event.target)) { setExpanded(null); setMobileOpen(false); } };
    const resize = () => { setExpanded(null); setMobileOpen(false); };
    const desktop = window.matchMedia('(min-width: 960px)');
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    desktop.addEventListener('change', resize);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); desktop.removeEventListener('change', resize); };
  }, []);
  return <header className="site-header" ref={header} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (expanded !== null) { header.current.querySelector(`[data-menu-trigger="${expanded}"]`)?.focus(); setExpanded(null); }
    else if (mobileOpen) { setMobileOpen(false); mobileTrigger.current?.focus(); }
  }}>
    <a href="#/option-1/home" className="brand" aria-label="TAG Aviation home"><img src={logo} alt="TAG Aviation" width="90" height="65" /></a>
    <nav id={`${id}-navigation`} aria-label="Main navigation" className={mobileOpen ? 'open' : ''}>
      {groups.map((group, index) => <div key={group.title} className={`nav-item ${group.wide ? 'nav-item-wide' : ''}`} onPointerEnter={event => { if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 960px)').matches) setExpanded(index); }} onPointerLeave={event => { if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) setExpanded(null); }}>
        <button type="button" className="nav-trigger" data-menu-trigger={index} aria-expanded={expanded === index} aria-controls={`${id}-submenu-${index}`} onClick={event => setExpanded(current => event.detail > 0 && window.matchMedia('(min-width: 960px)').matches ? index : current === index ? null : index)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setExpanded(index); } }}>{group.title}<Chevron /></button>
        {expanded === index && <div id={`${id}-submenu-${index}`} className={`nav-submenu ${group.wide ? 'nav-submenu-wide' : ''}`}><div className="nav-submenu-inner wrap">
          {group.wide && <div className="nav-intro"><span className="eyebrow">THE WORLD OF TAG</span><p>Expertise at<br /><em>every altitude.</em></p></div>}
          {group.columns.map((column, c) => <section key={c} className="nav-column">{column.title && <h2>{column.title}</h2>}<ul>{column.items.map(item => <li key={item}><span role="link" aria-disabled="true">{item}</span></li>)}</ul></section>)}
        </div></div>}
      </div>)}
      <button type="button" className="nav-inactive" disabled>Private charter</button>
      <button type="button" className="nav-inactive" disabled>The TAG difference</button>
      <button type="button" className="nav-contact" disabled>Contact</button>
    </nav>
    <div className="header-actions"><button className="button primary header-cta" onClick={() => { setMobileOpen(false); setExpanded(null); onPlan(); }}>Plan your flight <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></button><button ref={mobileTrigger} className="menu-toggle" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls={`${id}-navigation`} onClick={() => { setMobileOpen(!mobileOpen); setExpanded(null); }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={mobileOpen ? 'm5 5 14 14M19 5 5 19' : 'M4 8h16M4 16h16'} /></svg></button></div>
  </header>;
}
