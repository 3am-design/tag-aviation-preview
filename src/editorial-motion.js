import { useLayoutEffect, useRef } from 'react';

// Once per visit, with visible content as the fallback if motion is unavailable.
export function useEditorialMotion(page, completed) {
  const visited = useRef(new Set());
  useLayoutEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intros = [...document.querySelectorAll('[data-tag-intro]')];
    const reveals = [...document.querySelectorAll('[data-tag-reveal]')];
    let observer, frameOne, frameTwo;
    const show = item => item.classList.add('is-tag-visible');
    const showAll = () => { intros.forEach(show); reveals.forEach(show); observer?.disconnect(); };
    const finishOnPreference = () => { if (media.matches) showAll(); };
    const finishOnHide = () => { if (document.hidden) intros.forEach(show); };
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
          }), { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
          reveals.forEach(item => observer.observe(item));
        } else reveals.forEach(show);
      }
      visited.current.add(page);
      media.addEventListener('change', finishOnPreference);
      document.addEventListener('visibilitychange', finishOnHide);
      document.addEventListener('focusin', focus);
    } catch { root.classList.remove('tag-motion-ready'); showAll(); }
    return () => {
      cancelAnimationFrame(frameOne); cancelAnimationFrame(frameTwo);
      observer?.disconnect();
      media.removeEventListener('change', finishOnPreference);
      document.removeEventListener('visibilitychange', finishOnHide);
      document.removeEventListener('focusin', focus);
      root.classList.remove('tag-motion-ready');
    };
  }, [page, completed]);
}
