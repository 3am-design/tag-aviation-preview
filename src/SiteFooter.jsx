import React from 'react';

function SocialIcon({ name }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': true };
  if (name === 'LinkedIn') return <svg {...common} fill="currentColor"><circle cx="4.6" cy="5.1" r="1.7" /><path d="M3.1 8.6h3V21h-3zM9.1 8.6H12v1.7c.7-1.2 1.9-2 3.8-2 3.2 0 4.9 1.9 4.9 5.6V21h-3v-6.4c0-2.2-.7-3.3-2.4-3.3-1.8 0-3.2 1.3-3.2 3.5V21h-3z" /></svg>;
  if (name === 'Facebook') return <svg {...common} fill="currentColor"><path d="M13.8 22v-9.1h3.1l.5-3.5h-3.6V7.2c0-1 .3-1.7 1.8-1.7h1.9V2.4c-.9-.2-1.9-.3-2.8-.3-2.8 0-4.8 1.7-4.8 4.9v2.4H7v3.5h2.9V22z" /></svg>;
  if (name === 'Instagram') return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.65"><rect x="3" y="3" width="18" height="18" rx="5.3" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M10.5 16.2c-.7.2-1.5.3-2.3.3-.9 0-1.8-.1-2.6-.4l-3 1 .9-2.5C1.9 13.4 1 11.8 1 10c0-3.6 3.5-6.5 7.8-6.5 4 0 7.3 2.4 7.7 5.6" /><path d="M23 15.2c0 1.6-.8 3-2.1 4l.6 2-2.4-.8c-.7.2-1.5.3-2.3.3-3.4 0-6.2-2.4-6.2-5.5s2.8-5.5 6.2-5.5 6.2 2.5 6.2 5.5Z" /><g fill="currentColor" stroke="none"><circle cx="5.8" cy="8.1" r=".95" /><circle cx="11.7" cy="8.1" r=".95" /><circle cx="14.7" cy="13.8" r=".8" /><circle cx="19.2" cy="13.8" r=".8" /></g></svg>;
}
export default function SiteFooter({ logo }) {
  return <footer className="site-footer">
    <div className="footer-main wrap">
      <div className="footer-identity"><a href="#/option-1/home" aria-label="TAG Aviation home"><img src={logo} width="96" height="72" alt="TAG Aviation" /></a><p>A world of your own.<span>Swiss heritage. Since 1966.</span></p></div>
      <div className="footer-links"><a role="link" aria-disabled="true">Safety & assurance</a><a role="link" aria-disabled="true">Privacy policy</a></div>
      <div className="footer-connect"><span className="eyebrow">CONNECT WITH TAG</span><div className="footer-social" aria-label="Social media">{['LinkedIn', 'Facebook', 'Instagram', 'WeChat'].map(name => <span key={name} role="link" aria-disabled="true" aria-label={name} title={name}><SocialIcon name={name} /></span>)}</div></div>
    </div>
    <div className="footer-bottom wrap"><span>© {new Date().getFullYear()} TAG Aviation</span><span>Thoughtfully considered. Personally delivered.</span></div>
  </footer>;
}
