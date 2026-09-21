import { useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// One scene clock keeps the opening and viewport reveals in the same reading order.
const homeBarDuration = Math.round(900 / 0.7);
const homeMenuDuration = Math.round(1000 / 0.7);
const homeFrameStart = Math.max(2440 + homeBarDuration, 2520 + homeMenuDuration) + 60;
const sequence = {
  home: {
    // Three reading beats: banner copy, navigation, then the booking invitation.
    hero: [180, 400, 660, 1060, 1410],
    header: [2680, 2850, 2940, 3030, 3120, 3220],
    utility: [2650, 2950],
    bar: 2440, barDuration: homeBarDuration,
    headerSurface: 2520, headerSurfaceDuration: homeMenuDuration,
    // Both backgrounds finish drawing before the photo starts to crop.
    frame: homeFrameStart, frameDuration: 1250,
    booking: homeFrameStart + 750, end: homeFrameStart + 1950, peer: 160,
  },
  page: { page: 150, utility: 550, header: 550, bar: 0, panel: 1150 },
  peer: 260,
  imageDeadline: 1500,
};

export function useEditorialMotion(page, completed) {
  const visited = useRef(new Set());
  useLayoutEffect(() => {
    if (page !== 'home') return;
    const root = document.documentElement;
    const hero = document.querySelector('.hero');
    const copy = hero?.querySelector('.hero-copy');
    const booking = document.querySelector('.booking-section');
    const header = document.querySelector('.site-header');
    const utility = document.querySelector('.utility-bar');
    if (!hero || !copy || !booking || !header || !utility) return;
    // Apply the compact-copy rules before measuring, including on a return visit.
    root.classList.add('tag-home-motion');
    const properties = ['--tag-header-height', '--tag-hero-height', '--tag-photo-height', '--tag-photo-bottom'];
    const measure = () => {
      const height = window.innerHeight;
      const headerHeight = header.offsetHeight + utility.offsetHeight;
      const overlap = -parseFloat(getComputedStyle(booking).marginTop);
      const gap = Math.round(Math.min(64, Math.max(40, height * 0.055)));
      // On small screens, keep readable copy and let the longer form flow below the fold.
      const heroHeight = Math.max(copy.offsetHeight + overlap + 20, height - headerHeight - booking.getBoundingClientRect().height + overlap - gap);
      const photoHeight = Math.max(height, headerHeight + heroHeight);
      const values = [headerHeight, heroHeight, photoHeight, photoHeight - headerHeight - heroHeight];
      properties.forEach((name, index) => root.style.setProperty(name, `${values[index]}px`));
    };
    measure();
    const observer = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    [copy, booking, header, utility].forEach(item => observer?.observe(item));
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      properties.forEach(name => root.style.removeProperty(name));
    };
  }, [page]);
  useLayoutEffect(() => {
    if (page !== 'home') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scroll;
    const reset = () => scroll?.scrollTo(window.scrollY, { immediate: true });
    const onKey = event => {
      if (['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) reset();
    };
    const sync = () => {
      scroll?.destroy();
      scroll = undefined;
      if (media.matches || document.hidden) return;
      scroll = new Lenis({
        autoRaf: true, smoothWheel: true, syncTouch: false,
        lerp: 0.085, wheelMultiplier: 0.85,
        stopInertiaOnNavigate: true,
        // Portalled booking fields and the compact menu keep native scrolling.
        prevent: node => node.matches('.booking-popover, .site-header nav, textarea, select, [data-lenis-prevent]'),
      });
    };
    sync();
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('hashchange', reset);
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('focusin', reset, true);
    document.addEventListener('pointerdown', reset, true);
    return () => {
      scroll?.destroy();
      media.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('hashchange', reset);
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('focusin', reset, true);
      document.removeEventListener('pointerdown', reset, true);
    };
  }, [page]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intros = [...document.querySelectorAll('[data-tag-intro]')];
    const reveals = [...document.querySelectorAll('[data-tag-reveal]')];
    const heroes = intros.filter(item => item.dataset.tagIntro === 'hero');
    const groups = [...intros, ...reveals];
    const parts = [];
    const visit = `${page}:${completed ? 'complete' : 'entry'}`;
    const sectionClocks = new Map();
    const timing = page === 'home' ? sequence.home : sequence.page;
    let observer, frameOne, frameTwo, sceneStart;
    let disposed = false, instant = false, opening = false, interrupted = false, startQueued = false, cancelImage = () => {};
    const openingTimers = new Set();
    const clearOpeningTimers = () => {
      openingTimers.forEach(timer => window.clearTimeout(timer));
      openingTimers.clear();
    };
    const finishOpening = () => {
      opening = false;
      clearOpeningTimers();
      root.classList.remove('tag-photo-opening', 'tag-photo-framed', 'tag-photo-catchup');
    };
    const after = (delay, callback) => {
      const timer = window.setTimeout(() => { openingTimers.delete(timer); if (!disposed) callback(); }, delay);
      openingTimers.add(timer);
    };
    const show = item => item.classList.add('is-tag-visible');
    const expose = item => {
      item.classList.remove('tag-motion-reset');
      item.classList.add('tag-motion-instant');
      show(item);
      observer?.unobserve(item);
    };
    const showAll = () => {
      instant = true;
      finishOpening();
      cancelImage();
      cancelAnimationFrame(frameOne); cancelAnimationFrame(frameTwo);
      groups.forEach(expose);
      observer?.disconnect();
    };
    const onPreference = () => { if (media.matches) showAll(); };
    const onVisibility = () => { if (document.hidden) showAll(); };
    const skipOpening = () => {
      if (!opening) return;
      interrupted = true;
      opening = false;
      clearOpeningTimers();
      root.classList.add('tag-photo-catchup', 'tag-photo-framed');
      // Keep the current visual frame and shorten the remaining entrance gracefully.
      // Focusing a control still exposes that control immediately via interact().
      [...intros, ...reveals.filter(item => item.dataset.tagReveal === 'booking')].forEach(item => {
        item.classList.add('tag-motion-catchup');
        show(item);
        // CSS timing changes alone do not retime transitions already in flight.
        // Remove their remaining wait, then ease from the current frame to rest.
        item.getAnimations?.({ subtree: true }).forEach(animation => {
          if (!('transitionProperty' in animation)) return;
          const { delay } = animation.effect.getTiming();
          const { endTime } = animation.effect.getComputedTiming();
          animation.currentTime = Math.max(animation.currentTime || 0, delay);
          animation.updatePlaybackRate(Math.max(1, (endTime - animation.currentTime) / 360));
        });
      });
      after(420, finishOpening);
      // Continue the ordinary scroll reveals even when the opening is interrupted.
      if (sceneStart === undefined) { cancelImage(); begin(); }
    };
    const onScroll = () => { if (window.scrollY > 8) skipOpening(); };
    const interact = event => {
      // The route heading receives programmatic focus; preserve its intro.
      if (event.target.matches('h1[tabindex="-1"]')) return;
      const item = event.target.closest('[data-tag-reveal], [data-tag-intro]');
      if (item) { skipOpening(); expose(item); }
    };
    const reveal = item => {
      const now = performance.now();
      const section = item.closest('[data-tag-sequence]');
      let due = now;
      if (section) {
        if (!sectionClocks.has(section)) sectionClocks.set(section, now);
        const peers = [...section.querySelectorAll('[data-tag-reveal]')];
        due = sectionClocks.get(section) + peers.indexOf(item) * (timing.peer || sequence.peer);
        if (section.classList.contains('flow-grid')) due = Math.max(due, sceneStart + sequence.page.panel + peers.indexOf(item) * sequence.peer);
      }
      if (item.dataset.tagReveal === 'booking' && !interrupted) due = Math.max(due, sceneStart + sequence.home.booking);
      // Content reached later in the scroll does not wait for an expired opening beat.
      item.style.setProperty('--tag-reveal-delay', `${Math.max(0, due - now)}ms`);
      show(item);
      observer?.unobserve(item);
    };
    const begin = () => {
      if (disposed || instant || startQueued || sceneStart !== undefined) return;
      startQueued = true;
      frameOne = requestAnimationFrame(() => { frameTwo = requestAnimationFrame(() => {
        if (disposed || instant) return;
        startQueued = false;
        sceneStart = performance.now();
        if (opening) after(sequence.home.end, finishOpening);
        groups.forEach(item => item.classList.remove('tag-motion-reset'));
        if (root.classList.contains('tag-photo-opening')) root.classList.add('tag-photo-framed');
        intros.forEach(show);
        reveals.forEach(item => observer ? observer.observe(item) : expose(item));
      }); });
    };
    try {
      root.classList.add('tag-motion-ready');
      root.classList.toggle('tag-home-motion', page === 'home');
      root.style.setProperty('--tag-frame-start', `${sequence.home.frame}ms`);
      root.style.setProperty('--tag-frame-duration', `${sequence.home.frameDuration}ms`);
      root.style.setProperty('--tag-motion-bar', `${timing.barDuration ?? 900}ms`);
      root.style.setProperty('--tag-motion-menu-surface', `${timing.headerSurfaceDuration ?? 1000}ms`);
      intros.forEach(group => {
        const beats = timing[group.dataset.tagIntro] || 0;
        group.style.setProperty('--tag-intro-start', `${Array.isArray(beats) ? 0 : beats}ms`);
        group.style.setProperty('--tag-surface-start', `${group.dataset.tagIntro === 'header' ? timing.headerSurface ?? timing.bar : timing.bar}ms`);
        group.querySelectorAll('[data-tag-intro-item]').forEach((item, index) => {
          item.style.setProperty('--tag-order', index);
          if (Array.isArray(beats)) item.style.setProperty('--tag-intro-beat', `${beats[index] ?? beats.at(-1)}ms`);
          else item.style.removeProperty('--tag-intro-beat');
        });
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
      if (heroes.length && !media.matches && !visited.current.has(visit) && !document.hidden && window.scrollY < 8) {
        opening = true;
        root.classList.add('tag-photo-opening');
      }
      if (media.matches || visited.current.has(visit) || document.hidden) showAll();
      else {
        groups.filter(item => !['header', 'utility'].includes(item.dataset.tagIntro) || !item.classList.contains('is-tag-visible')).forEach(item => {
          item.classList.add('tag-motion-reset');
          item.classList.remove('is-tag-visible', 'tag-motion-instant', 'tag-motion-catchup');
        });
        if ('IntersectionObserver' in window) {
          observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) reveal(entry.target);
          }), { threshold: 0.01, rootMargin: page === 'home' ? '0px 0px -36px 0px' : '0px 0px 100px 0px' });
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
      visited.current.add(visit);
      media.addEventListener('change', onPreference);
      document.addEventListener('visibilitychange', onVisibility);
      document.addEventListener('focusin', interact);
      document.addEventListener('pointerdown', interact, true);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', skipOpening);
    } catch { root.classList.remove('tag-motion-ready'); showAll(); }
    return () => {
      disposed = true;
      finishOpening();
      cancelImage();
      cancelAnimationFrame(frameOne); cancelAnimationFrame(frameTwo);
      observer?.disconnect();
      media.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('focusin', interact);
      document.removeEventListener('pointerdown', interact, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', skipOpening);
      groups.forEach(item => item.classList.remove('tag-motion-reset', 'tag-motion-catchup'));
      parts.forEach(item => { item.removeAttribute('data-tag-part'); item.style.removeProperty('--tag-part-order'); });
      ['--tag-frame-start', '--tag-frame-duration', '--tag-motion-bar', '--tag-motion-menu-surface'].forEach(name => root.style.removeProperty(name));
      root.classList.remove('tag-motion-ready', 'tag-home-motion');
    };
  }, [page, completed]);
}
