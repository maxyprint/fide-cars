(function () {
  'use strict';

  // ── Lenis Smooth Scroll ──────────────────────────────────────────────
  // Use ONLY gsap.ticker (not requestAnimationFrame) to avoid double-ticking
  var lenis;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback: only use RAF if GSAP not available
      (function tick(time) { lenis.raf(time); requestAnimationFrame(tick); })(0);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {

    // ── Anchor link scrolling via Lenis ───────────────────────────────
    if (lenis) {
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var target = document.querySelector(a.getAttribute('href'));
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80, duration: 1.2, easing: function (t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; } });
          }
        });
      });
    }

    // ── Mobile Navigation ──────────────────────────────────────────────
    var hamburger = document.querySelector('[data-hamburger]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    var backdrop = document.querySelector('[data-mobile-backdrop]');

    if (hamburger && mobileMenu) {
      function openMenu() {
        mobileMenu.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-visible');
        document.body.classList.add('menu-open');
        hamburger.setAttribute('aria-expanded', 'true');
        if (lenis) lenis.stop();
      }
      function closeMenu() {
        mobileMenu.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-visible');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
        if (lenis) lenis.start();
      }
      hamburger.addEventListener('click', function () {
        mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
      });
      if (backdrop) backdrop.addEventListener('click', closeMenu);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
      mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    }

    // ── GSAP Animationen ───────────────────────────────────────────────
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

      // Hero Headline — clip-path reveal on load
      var heroLines = document.querySelectorAll('.hero-line');
      heroLines.forEach(function (el, i) {
        gsap.fromTo(el,
          { clipPath: 'inset(0 0 100% 0)', y: 20 },
          { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 + i * 0.15 }
        );
      });

      var heroSub = document.querySelector('.hero-sub');
      var heroActions = document.querySelector('.hero-actions');
      if (heroSub) gsap.to(heroSub, { opacity: 1, y: 0, duration: 0.7, delay: 0.75, ease: 'power2.out', from: { opacity: 0, y: 16 } });
      if (heroActions) gsap.to(heroActions, { opacity: 1, y: 0, duration: 0.7, delay: 0.95, ease: 'power2.out', from: { opacity: 0, y: 16 } });

      // Hero BG Parallax
      var heroBg = document.querySelector('.hero-bg');
      if (heroBg) {
        gsap.to(heroBg, {
          yPercent: 25, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      }

      // Clip-path reveal for über-uns image
      gsap.utils.toArray('.reveal-clip').forEach(function (el) {
        gsap.fromTo(el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' } }
        );
      });

      // Counter animation
      gsap.utils.toArray('.counter').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2.0, ease: 'power2.out', snap: { val: 1 },
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          onUpdate: function () { el.textContent = Math.round(obj.val).toLocaleString('de-AT'); }
        });
      });

      // Staggered cards
      gsap.utils.toArray('.stagger-parent').forEach(function (parent) {
        var cards = parent.querySelectorAll('.stagger-child');
        gsap.fromTo(cards,
          { opacity: 0, y: 44 },
          { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.1,
            scrollTrigger: { trigger: parent, start: 'top 84%' } }
        );
      });

      // Parallax images inside bento cards
      gsap.utils.toArray('.parallax-img').forEach(function (img) {
        gsap.to(img, {
          yPercent: -15, ease: 'none',
          scrollTrigger: { trigger: img.closest('.parallax-wrap') || img.parentElement, scrub: 1 }
        });
      });

      // Magnetic buttons
      document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var rect = btn.getBoundingClientRect();
          var x = e.clientX - rect.left - rect.width / 2;
          var y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        });
      });

    } else {
      // No GSAP — make hero elements visible immediately
      document.querySelectorAll('.hero-line').forEach(function (el) {
        el.style.clipPath = 'none';
      });
      var sub = document.querySelector('.hero-sub');
      var act = document.querySelector('.hero-actions');
      if (sub) sub.style.opacity = '1';
      if (act) act.style.opacity = '1';
    }

    // ── L2 Scroll-Reveal (IntersectionObserver) ────────────────────────
    var animEls = document.querySelectorAll('.animate');
    if (animEls.length && 'IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
      animEls.forEach(function (el) { obs.observe(el); });
    } else {
      animEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // ── Marquee (clone track for seamless loop) ────────────────────────
    var track = document.querySelector('.marquee-track');
    if (track) {
      var clone = track.cloneNode(true);
      track.parentElement.appendChild(clone);
    }

  });
})();
