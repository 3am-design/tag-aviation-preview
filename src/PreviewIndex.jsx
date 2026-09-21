import React from 'react';
import { optionOnePages, previewPath } from './preview-routes.js';
import './preview.css';

export function PreviewToolbar({ page }) {
  return <nav className="preview-toolbar" aria-label="Design preview navigation">
    <a href="#/" className="preview-back"><span aria-hidden="true">←</span> All directions</a>
    <span className="preview-option-label">OPTION 01</span>
    <div>{optionOnePages.map(item => <a key={item.key} href={previewPath(item.key)} aria-current={page === item.key ? 'page' : undefined}>{item.label}</a>)}</div>
  </nav>;
}

export default function PreviewIndex({ notFound = false }) {
  return <main className="review-portal">
    <header className="review-header"><a href="#/" className="review-wordmark">TAG <span>AVIATION</span></a><span>WEBSITE REVAMP <i>/</i> DESIGN PREVIEW</span><span className="review-for">Prepared for <strong>firmstudio</strong></span></header>
    {notFound ? <section className="review-intro"><p className="review-kicker">DESIGN PREVIEW</p><h1>This preview is<br /><em>not available yet.</em></h1><a className="review-primary" href="#/">Return to all directions <span aria-hidden="true">↗</span></a></section> : <>
      <section className="review-intro"><div><p className="review-kicker"><span /> TAG AVIATION · WEBSITE REVAMP</p><h1>A new perspective.<br /><em>Two design directions.</em></h1></div><div className="review-intro-note"><p>Explore the design concepts <br />and the journey behind each one.</p><div><span>ENGLISH</span><span>DESKTOP & MOBILE</span></div></div></section>
      <section className="review-options" aria-label="Design directions">
        <article className="review-option"><div className="review-option-heading"><span>OPTION <b>01</b></span><span className="review-status"><i /> Available to preview</span></div><a className="review-cover" href={previewPath('home')} aria-label="Preview Option 1 homepage"><img src={`${import.meta.env.BASE_URL}assets/58dd90f02981a233.webp`} alt="A TAG Aviation private jet" /><div><span>A WORLD OF YOUR OWN</span><h2>Quiet confidence.<br /><em>A personal journey.</em></h2><span className="review-cover-arrow" aria-hidden="true">↗</span></div></a><div className="review-option-body"><p>An editorial approach to private aviation, with an effortless path from inspiration to enquiry.</p><ol className="review-page-links">{optionOnePages.map(item => <li key={item.key}><a href={previewPath(item.key)}><span>{item.number}</span><div><strong>{item.label}</strong><small>{item.description}</small></div><span className="review-link-arrow" aria-hidden="true">↗</span></a></li>)}</ol><a className="review-primary" href={previewPath('home')}>Explore Option 1 <span aria-hidden="true">↗</span></a></div></article>
        <article className="review-option review-option-pending"><div className="review-option-heading"><span>OPTION <b>02</b></span><span className="review-status pending">In preparation</span></div><div className="review-pending-cover"><span className="review-outline-number" aria-hidden="true">02</span><div><p className="review-kicker">ANOTHER POINT OF VIEW</p><h2>A different expression.<br /><em>The same ambition.</em></h2></div></div><div className="review-option-body"><p>A second creative direction will be presented here, with the same three-page journey for comparison.</p><ol className="review-page-links review-pending-links">{optionOnePages.map(item => <li key={item.key}><div><span>{item.number}</span><strong>{item.label}</strong><small>Coming soon</small></div></li>)}</ol><div className="review-pending-note">Preview links will appear when this direction is ready.</div></div></article>
      </section>
      <aside className="review-guidance"><span>HOW TO EXPLORE</span><p>Open any page directly, or start at the homepage and follow the complete enquiry journey. The concepts adapt to desktop and mobile.</p><p>For design review only.<br />Enquiries are simulated; no booking is made.</p></aside>
    </>}
    <footer className="review-footer"><span>TAG AVIATION <i>/</i> WEBSITE DESIGN DIRECTIONS</span><span>Prepared for firmstudio · For review</span></footer>
  </main>;
}
