import { useLayoutEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function useOptionTwoMotion(root, page) {
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');
    let scroll;
    const settle = () => scroll?.scrollTo(window.scrollY, { immediate: true });
    const keyboard = event => {
      if (['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) settle();
    };
    const sync = () => {
      scroll?.destroy();
      scroll = undefined;
      if (reduce.matches || coarse.matches || document.hidden) return;
      scroll = new Lenis({
        autoRaf: true, smoothWheel: true, syncTouch: false,
        lerp: .085, wheelMultiplier: .9, stopInertiaOnNavigate: true,
        prevent: node => node.matches('.booking-popover, .o2-navigation, textarea, select, [data-lenis-prevent]'),
        virtualScroll: ({ event }) => !event.ctrlKey && !event.shiftKey,
      });
    };
    sync();
    reduce.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('keydown', keyboard, true);
    window.addEventListener('hashchange', settle);
    document.addEventListener('focusin', settle, true);
    document.addEventListener('pointerdown', settle, true);
    return () => {
      scroll?.destroy();
      reduce.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('keydown', keyboard, true);
      window.removeEventListener('hashchange', settle);
      document.removeEventListener('focusin', settle, true);
      document.removeEventListener('pointerdown', settle, true);
    };
  }, [page]);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer, imageObserver, frame, secondFrame, scrollFrame, cancelled = false;
    const layers = [...element.querySelectorAll('[data-o2-parallax]')];
    const coarse = window.matchMedia('(pointer: coarse)');
    const updateLayers = () => {
      scrollFrame = null;
      if (reduce.matches || coarse.matches || document.hidden) return;
      const height = window.innerHeight;
      for (const node of layers) {
        const rect = node.parentElement.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > height + 80) continue;
        const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / (height / 2 + rect.height / 2)));
        node.style.setProperty('--o2-shift', `${(progress * Number(node.dataset.o2Parallax)).toFixed(2)}px`);
      }
    };
    const queueLayers = () => {
      if (!scrollFrame && !reduce.matches && !coarse.matches && !document.hidden) scrollFrame = requestAnimationFrame(updateLayers);
    };
    const showAll = () => {
      element.classList.remove('o2-motion', 'o2-entering');
      layers.forEach(node => node.style.removeProperty('--o2-shift'));
      element.querySelectorAll('[data-o2-reveal]').forEach(node => node.classList.add('o2-visible'));
    };
    const focus = event => {
      event.target.closest('[data-o2-reveal]')?.classList.add('o2-visible');
      element.classList.remove('o2-entering');
    };
    const visibility = () => { element.classList.toggle('o2-paused', document.hidden); if (!document.hidden) queueLayers(); };
    const setup = () => {
      observer?.disconnect(); imageObserver?.disconnect();
      if (reduce.matches || !window.IntersectionObserver) { showAll(); return; }
      element.classList.add('o2-motion');
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('o2-visible'); observer.unobserve(entry.target); }
      }), { rootMargin: '0px 0px -5% 0px', threshold: .04 });
      element.querySelectorAll('[data-o2-reveal]').forEach(node => observer.observe(node));
      imageObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('o2-in-view', entry.isIntersecting)));
      element.querySelectorAll('[data-o2-drift]').forEach(node => imageObserver.observe(node));
      if (page === 'home') {
        element.classList.add('o2-entering');
        const image = element.querySelector('.o2-hero-image');
        const start = () => {
          if (cancelled || reduce.matches) return;
          frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => {
            element.classList.remove('o2-entering'); element.classList.add('o2-arrived');
          }); });
        };
        if (image?.decode) image.decode().catch(() => {}).then(start); else start();
      }
    };
    setup(); visibility(); queueLayers();
    window.addEventListener('scroll', queueLayers, { passive: true });
    window.addEventListener('resize', queueLayers, { passive: true });
    reduce.addEventListener('change', setup);
    document.addEventListener('visibilitychange', visibility);
    element.addEventListener('focusin', focus);
    return () => {
      cancelled = true; observer?.disconnect(); imageObserver?.disconnect();
      cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', queueLayers); window.removeEventListener('resize', queueLayers);
      layers.forEach(node => node.style.removeProperty('--o2-shift'));
      reduce.removeEventListener('change', setup);
      document.removeEventListener('visibilitychange', visibility);
      element.removeEventListener('focusin', focus);
      element.classList.remove('o2-motion', 'o2-entering', 'o2-arrived', 'o2-paused');
    };
  }, [root, page]);
}
