import { useLayoutEffect, useRef } from 'react';

// Reveals run once per visit. The hero drifts forward without a visible loop reset.
export function useEditorialMotion(page, completed) {
  const visited = useRef(new Set());
  useLayoutEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intros = [...document.querySelectorAll('[data-tag-intro]')];
    const reveals = [...document.querySelectorAll('[data-tag-reveal]')];
    const inView = new Set();
    let observer, heroObserver, frameOne, frameTwo;
    const show = item => item.classList.add('is-tag-visible');
    const showAll = () => { intros.forEach(show); reveals.forEach(show); observer?.disconnect(); };
    const updateDrift = () => intros.forEach(item => item.classList.toggle('is-tag-drifting', !document.hidden && !media.matches && inView.has(item)));
    const onPreference = () => { if (media.matches) showAll(); updateDrift(); };
    const onVisibility = () => { if (document.hidden) intros.forEach(show); updateDrift(); };
    const focus = event => {
      const item = event.target.closest('[data-tag-reveal], [data-tag-intro]');
      if (item) { item.classList.add('tag-motion-instant'); show(item); observer?.unobserve(item); }
    };
    try {
      root.classList.add('tag-motion-ready');
      intros.forEach(group => group.querySelectorAll('[data-tag-intro-item]').forEach((item, index) => item.style.setProperty('--tag-order', index)));
      if (media.matches || visited.current.has(page) || document.hidden) showAll();
      else {
        frameOne = requestAnimationFrame(() => { frameTwo = requestAnimationFrame(() => intros.forEach(show)); });
        if ('IntersectionObserver' in window) {
          observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) { show(entry.target); observer.unobserve(entry.target); }
          }), { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
          reveals.forEach(item => observer.observe(item));
        } else reveals.forEach(show);
      }
      if ('IntersectionObserver' in window) {
        heroObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => { if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target); });
          updateDrift();
        }, { threshold: 0 });
        intros.forEach(item => heroObserver.observe(item));
      } else { intros.forEach(item => inView.add(item)); updateDrift(); }
      visited.current.add(page);
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
      intros.forEach(item => item.classList.remove('is-tag-drifting'));
      root.classList.remove('tag-motion-ready');
    };
  }, [page, completed]);
}
