import React, { useEffect, useId, useRef, useState } from 'react';

const navigation = ['Why TAG', 'Aircraft management', 'Private charter', 'Maintenance', 'FBO handling', 'Global training', 'Contact'];

export default function SiteHeader({ logo, page, onPlan }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1199px)').matches);
  const header = useRef(null), mobileTrigger = useRef(null);
  const id = useId();
  useEffect(() => { setMobileOpen(false); }, [page]);
  useEffect(() => {
    const outside = event => { if (!header.current?.contains(event.target)) { setMobileOpen(false); } };
    const resize = () => { setMobileOpen(false); setCompact(!desktop.matches); };
    const desktop = window.matchMedia('(min-width: 1200px)');
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    desktop.addEventListener('change', resize);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); desktop.removeEventListener('change', resize); };
  }, []);
  return <header className="site-header" data-tag-intro="header" ref={header} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (mobileOpen) { setMobileOpen(false); mobileTrigger.current?.focus(); }
  }}>
    <a href="#/option-1/home" className="brand" data-tag-intro-item aria-label="TAG Aviation home"><img src={logo} alt="TAG Aviation" width="90" height="65" /></a>
    <nav id={`${id}-navigation`} aria-label="Main navigation" aria-hidden={compact && !mobileOpen ? true : undefined} inert={compact && !mobileOpen} className={mobileOpen ? 'open' : ''}>
      {navigation.map(label => label === 'Contact' ? <div className="nav-contact-actions" key={label}>
        <button type="button" className="nav-inactive" data-tag-intro-item disabled>{label}</button>
        <button type="button" className="nav-search" aria-label="Search" data-tag-intro-item disabled><svg width="16" height="16" viewBox="0 0 461.516 461.516" fill="currentColor" aria-hidden="true"><path d="m185.746 371.332c41.251.001 81.322-13.762 113.866-39.11l122.778 122.778c9.172 8.858 23.787 8.604 32.645-.568 8.641-8.947 8.641-23.131 0-32.077l-122.778-122.778c62.899-80.968 48.252-197.595-32.716-260.494s-197.594-48.252-260.493 32.716-48.252 197.595 32.716 260.494c32.597 25.323 72.704 39.06 113.982 39.039zm-98.651-284.273c54.484-54.485 142.82-54.486 197.305-.002s54.486 142.82.002 197.305-142.82 54.486-197.305.002c-.001-.001-.001-.001-.002-.002-54.484-54.087-54.805-142.101-.718-196.585.239-.24.478-.479.718-.718z" /></svg></button>
      </div> : <button key={label} type="button" className="nav-inactive" data-tag-intro-item disabled>{label}</button>)}
    </nav>
    <div className="header-actions" data-tag-intro-item><button className="button primary header-cta" onClick={() => { setMobileOpen(false); onPlan(); }}>Plan your flight <svg className="tag-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg></button><button ref={mobileTrigger} className="menu-toggle" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls={`${id}-navigation`} onClick={() => { setMobileOpen(!mobileOpen); }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={mobileOpen ? 'm5 5 14 14M19 5 5 19' : 'M4 8h16M4 16h16'} /></svg></button></div>
  </header>;
}
