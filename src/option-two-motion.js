import { useLayoutEffect } from 'react';

export default function useOptionTwoMotion(root, page) {
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer, imageObserver, frame, secondFrame, cancelled = false;
    const showAll = () => {
      element.classList.remove('o2-motion', 'o2-entering');
      element.querySelectorAll('[data-o2-reveal]').forEach(node => node.classList.add('o2-visible'));
    };
    const focus = event => {
      event.target.closest('[data-o2-reveal]')?.classList.add('o2-visible');
      element.classList.remove('o2-entering');
    };
    const visibility = () => element.classList.toggle('o2-paused', document.hidden);
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
          if (cancelled) return;
          frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => {
            element.classList.remove('o2-entering'); element.classList.add('o2-arrived');
          }); });
        };
        if (image?.decode) image.decode().catch(() => {}).then(start); else start();
      }
    };
    setup(); visibility();
    reduce.addEventListener('change', setup);
    document.addEventListener('visibilitychange', visibility);
    element.addEventListener('focusin', focus);
    return () => {
      cancelled = true; observer?.disconnect(); imageObserver?.disconnect();
      cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame);
      reduce.removeEventListener('change', setup);
      document.removeEventListener('visibilitychange', visibility);
      element.removeEventListener('focusin', focus);
      element.classList.remove('o2-motion', 'o2-entering', 'o2-arrived', 'o2-paused');
    };
  }, [root, page]);
}
