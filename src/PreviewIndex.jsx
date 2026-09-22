import React from 'react';
import { previewPages, previewPath } from './preview-routes.js';
import './preview.css';

const directions = [
  { option: 1, title: 'Editorial approach' },
  { option: 2, title: 'Cinematic approach' },
];

export default function PreviewIndex({ notFound = false }) {
  const pageUrl = (page, option) => new URL(previewPath(page, option), window.location.href).href;

  return <main className="review-portal">
    <header className="review-header">
      <h1>TAG AVIATION WEBSITE REVAMP</h1>
    </header>
    {notFound ? <section className="review-not-found">
      <h2>This page is unavailable.</h2>
      <a href="#/">Return to the design directions</a>
    </section> : <section className="review-options" aria-label="Design directions">
      {directions.map(({ option, title }) => <article className="review-option" key={option} aria-labelledby={`option-${option}-title`}>
        <a className="review-cover" href={previewPath('home', option)} target="_blank" rel="noopener noreferrer" aria-label={`Preview Direction ${option} homepage (opens in a new tab)`}>
          <img src={`${import.meta.env.BASE_URL}assets/option-${option}-preview.webp`} alt={`Direction ${option} homepage — ${title}`} width="1731" height="1032" />
        </a>
        <p className="review-option-number">Direction {option}</p>
        <h2 id={`option-${option}-title`}>{title}</h2>
        <ul className="review-page-links">
          {previewPages.map(({ key, label }) => <li key={key}>
            <a href={previewPath(key, option)} target="_blank" rel="noopener noreferrer" aria-label={`${label}, Direction ${option} (opens in a new tab)`}>
              <span className="review-link-label">{label}</span>
              <span className="review-link-url">{pageUrl(key, option)}</span>
            </a>
          </li>)}
        </ul>
      </article>)}
    </section>}
  </main>;
}
