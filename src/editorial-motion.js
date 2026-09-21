import { useLayoutEffect, useRef } from 'react';

// One scene clock keeps the opening and viewport reveals in the same reading order.
const sequence = {
  home: { hero: 900, utility: 1850, header: 1850, bar: 900, booking: 3100 },
  page: { page: 150, utility: 550, header: 550, bar: 0, panel: 1150 },
  peer: 360,
  imageDeadline: 1500,
};

export function useEditorialMotion(page, completed) {
  const visited = useRef(new Set());
  useLayoutEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intros = [...document.querySelectorAll('[data-tag-intro]')];
    const reveals = [...document.querySelectorAll('[data-tag-reveal]')];
    const heroes = intros.filter(item => item.dataset.tagIntro === 'hero');
    const groups = [...intros, ...reveals];
    const parts = [];
    const visit = `${page}:${completed ? 'complete' : 'entry'}`;
    const inView = new Set(), sectionClocks = new Map();
    const timing = page === 'home' ? sequence.home : sequence.page;
    let observer, heroObserver, frameOne, frameTwo, sceneStart;
    let disposed = false, instant = false, cancelImage = () => {};
    const show = item => item.classList.add('is-tag-visible');
    const expose = item => {
      item.classList.remove('tag-motion-reset');
      item.classList.add('tag-motion-instant');
      show(item);
      observer?.unobserve(item);
    };
    const showAll = () => {
      instant = true;
      cancelImage();
      cancelAnimationFrame(frameOne); cancelAnimationFrame(frameTwo);
      groups.forEach(expose);
      observer?.disconnect();
    };
    const updateDrift = () => heroes.forEach(item => item.classList.toggle('is-tag-drifting', !document.hidden && !media.matches && inView.has(item)));
    const onPreference = () => { if (media.matches) showAll(); updateDrift(); };
    const onVisibility = () => { if (document.hidden) showAll(); updateDrift(); };
    const interact = event => {
      // The route heading receives programmatic focus; preserve its intro.
      if (event.target.matches('h1[tabindex="-1"]')) return;
      const item = event.target.closest('[data-tag-reveal], [data-tag-intro]');
      if (item) expose(item);
    };
    const reveal = item => {
      const now = performance.now();
      const section = item.closest('[data-tag-sequence]');
      let due = now;
      if (section) {
        if (!sectionClocks.has(section)) sectionClocks.set(section, now);
        const peers = [...section.querySelectorAll('[data-tag-reveal]')];
        due = sectionClocks.get(section) + peers.indexOf(item) * sequence.peer;
        if (section.classList.contains('flow-grid')) due = Math.max(due, sceneStart + sequence.page.panel + peers.indexOf(item) * sequence.peer);
      }
      if (item.dataset.tagReveal === 'booking') due = Math.max(due, sceneStart + sequence.home.booking);
      // Content reached later in the scroll does not wait for an expired opening beat.
      item.style.setProperty('--tag-reveal-delay', `${Math.max(0, due - now)}ms`);
      show(item);
      observer?.unobserve(item);
    };
    const begin = () => {
      if (disposed || instant || sceneStart !== undefined) return;
      frameOne = requestAnimationFrame(() => { frameTwo = requestAnimationFrame(() => {
        if (disposed || instant) return;
        sceneStart = performance.now();
        groups.forEach(item => item.classList.remove('tag-motion-reset'));
        intros.forEach(show);
        reveals.forEach(item => observer ? observer.observe(item) : expose(item));
      }); });
    };
    try {
      root.classList.add('tag-motion-ready');
      intros.forEach(group => {
        group.style.setProperty('--tag-intro-start', `${timing[group.dataset.tagIntro] || 0}ms`);
        group.style.setProperty('--tag-surface-start', `${timing.bar}ms`);
        group.querySelectorAll('[data-tag-intro-item]').forEach((item, index) => item.style.setProperty('--tag-order', index));
      });
      reveals.forEach(group => {
        let children = [];
        if (group.dataset.tagReveal === 'copy') children = group.classList.contains('section-heading') ? [...group.querySelectorAll('.eyebrow, h2, :scope > p')] : [...group.children];
        else if (group.classList.contains('service-card')) children = [...group.querySelector('.service-copy').children];
        else if (group.dataset.tagReveal === 'booking') children = [...group.querySelectorAll('.booking-top, .quick-fields')];
        children.forEach((item, index) => {
          item.setAttribute('data-tag-part', '');
          item.style.setProperty('--tag-part-order', index);
          parts.push(item);
        });
      });
      if (media.matches || visited.current.has(visit) || document.hidden) showAll();
      else {
        groups.filter(item => !['header', 'utility'].includes(item.dataset.tagIntro) || !item.classList.contains('is-tag-visible')).forEach(item => {
          item.classList.add('tag-motion-reset');
          item.classList.remove('is-tag-visible', 'tag-motion-instant');
        });
        if ('IntersectionObserver' in window) {
          observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) reveal(entry.target);
          }), { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
        }
        const image = heroes[0]?.querySelector('.hero-image');
        if (image) {
          let settled = false;
          const finish = () => { if (settled || disposed) return; settled = true; cancelImage(); begin(); };
          const loaded = () => {
            if (image.decode) image.decode().then(finish, finish);
            else finish();
          };
          const deadline = window.setTimeout(finish, sequence.imageDeadline);
          cancelImage = () => { window.clearTimeout(deadline); image.removeEventListener('load', loaded); image.removeEventListener('error', finish); };
          image.addEventListener('load', loaded, { once: true });
          image.addEventListener('error', finish, { once: true });
          if (image.complete) loaded();
        } else begin();
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
      document.addEventListener('focusin', interact);
      document.addEventListener('pointerdown', interact, true);
    } catch { root.classList.remove('tag-motion-ready'); showAll(); heroObserver?.disconnect(); }
    return () => {
      disposed = true;
      cancelImage();
      cancelAnimationFrame(frameOne); cancelAnimationFrame(frameTwo);
      observer?.disconnect(); heroObserver?.disconnect();
      media.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('focusin', interact);
      document.removeEventListener('pointerdown', interact, true);
      groups.forEach(item => item.classList.remove('tag-motion-reset'));
      parts.forEach(item => { item.removeAttribute('data-tag-part'); item.style.removeProperty('--tag-part-order'); });
      heroes.forEach(item => item.classList.remove('is-tag-drifting'));
      root.classList.remove('tag-motion-ready');
    };
  }, [page, completed]);
}
