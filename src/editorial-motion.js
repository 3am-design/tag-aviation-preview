import { useLayoutEffect, useRef } from 'react';

// Reveals run once per visit. The hero drifts forward without a visible loop reset.
export function useEditorialMotion(page, completed) {
  const visited = useRef(new Set());
  useLayoutEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intros = [...document.querySelectorAll('[data-tag-intro]')];
    const reveals = [...document.querySelectorAll('[data-tag-reveal]')];
    const heroes = intros.filter(item => item.classList.contains('hero'));
    const visit = `${page}:${completed ? 'complete' : 'entry'}`;
    const inView = new Set();
    let observer, heroObserver, frameOne, frameTwo;
    const show = item => item.classList.add('is-tag-visible');
    const showAll = () => { [...intros, ...reveals].forEach(item => { item.classList.remove('tag-motion-reset'); item.classList.add('tag-motion-instant'); show(item); }); observer?.disconnect(); };
    const updateDrift = () => heroes.forEach(item => item.classList.toggle('is-tag-drifting', !document.hidden && !media.matches && inView.has(item)));
    const onPreference = () => { if (media.matches) showAll(); updateDrift(); };
    const onVisibility = () => { if (document.hidden) intros.forEach(show); updateDrift(); };
    const focus = event => {
      // Route headings receive programmatic focus; only interactive focus skips motion.
      if (event.target.matches('h1[tabindex="-1"]')) return;
      const item = event.target.closest('[data-tag-reveal], [data-tag-intro]');
      if (item) { item.classList.remove('tag-motion-reset'); item.classList.add('tag-motion-instant'); show(item); observer?.unobserve(item); }
    };
    try {
      root.classList.add('tag-motion-ready');
      intros.forEach(group => group.querySelectorAll('[data-tag-intro-item]').forEach((item, index) => item.style.setProperty('--tag-order', index)));
      if (media.matches || visited.current.has(visit) || document.hidden) showAll();
      else {
        // React can reuse the same form/heading nodes between journey steps.
        // Reset page content, then give its initial frame time to paint.
        intros.filter(item => !['header', 'utility'].includes(item.dataset.tagIntro)).forEach(item => { item.classList.add('tag-motion-reset'); item.classList.remove('is-tag-visible', 'tag-motion-instant'); });
        reveals.forEach(item => { item.classList.add('tag-motion-reset'); item.classList.remove('is-tag-visible', 'tag-motion-instant'); });
        if ('IntersectionObserver' in window) {
          observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) { show(entry.target); observer.unobserve(entry.target); }
          }), { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
        } else reveals.forEach(show);
        frameOne = requestAnimationFrame(() => { frameTwo = requestAnimationFrame(() => {
          [...intros, ...reveals].forEach(item => item.classList.remove('tag-motion-reset'));
          intros.forEach(show);
          reveals.forEach(item => observer?.observe(item));
        }); });
      }
      if ('IntersectionObserver' in window) {
        heroObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => { if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target); });
          updateDrift();
        }, { threshold: 0 });
        heroes.forEach(item => heroObserver.observe(item));
      } else { heroes.forEach(item => inView.add(item)); updateDrift(); }
      visited.current.add(visit);
      media.addEventListener('change', onPreference);
      document.addEventListener('visibilitychange', onVisibility);
      document.addEventListener('focusin', focus);
    } catch { root.classList.remove('tag-motion-ready'); showAll(); heroObserver?.disconnect(); }
    return () => {
      cancelAnimationFrame(frameOne); cancelAnimationFrame(frameTwo);
      observer?.disconnect(); heroObserver?.disconnect();
      media.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('focusin', focus);
      [...intros, ...reveals].forEach(item => item.classList.remove('tag-motion-reset'));
      heroes.forEach(item => item.classList.remove('is-tag-drifting'));
      root.classList.remove('tag-motion-ready');
    };
  }, [page, completed]);
}
