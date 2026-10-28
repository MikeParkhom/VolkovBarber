(function () {
  'use strict';

  var BOOKING_URL = 'https://yandex.ru/web-maps/webview?mode=booking&booking[permalink]=171798453705&booking[standalone]=true&source=partner-cta';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Яндекс Запись: на десктопе открываем аккуратным окном, на телефоне — новой вкладкой.
  function openBooking(e) {
    e.preventDefault();
    var w = 480, h = 760;
    var wide = window.matchMedia('(min-width: 861px)').matches;
    var win = null;
    if (wide) {
      var left = Math.max(0, (screen.width - w) / 2);
      var top = Math.max(0, (screen.height - h) / 2);
      win = window.open(BOOKING_URL, 'yandex-booking', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
    }
    if (!win) win = window.open(BOOKING_URL, '_blank');
    if (win) win.opener = null;
    else window.location.href = BOOKING_URL;
  }
  document.querySelectorAll('[data-book], [data-yandex-booking]').forEach(function (el) {
    el.addEventListener('click', openBooking);
  });

  // Мобильное меню
  var toggle = document.querySelector('.nav__toggle');
  var list = document.getElementById('nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Открыть меню' : 'Закрыть меню');
      list.classList.toggle('is-open', !open);
    });
    list.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        list.classList.remove('is-open');
      }
    });
  }

  // Шапка: фон после начала прокрутки, на десктопе прячется при прокрутке вниз
  var header = document.querySelector('.header');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    var menuOpen = list && list.classList.contains('is-open');
    header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 400);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Галерея и лайтбокс
  var lb = document.getElementById('lightbox');
  var lbImg = lb && lb.querySelector('img');
  function closeLb() { lb.hidden = true; lbImg.removeAttribute('src'); document.body.style.overflow = ''; }
  document.querySelectorAll('.gallery button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      lbImg.src = btn.dataset.full || img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    });
  });
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // Анимации прокрутки (GSAP + ScrollTrigger). Без библиотеки или при
  // «уменьшить движение» страница остаётся статичной и полностью видимой.
  if (reduced || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  document.documentElement.classList.add('js-motion');
  var mobile = window.matchMedia('(max-width: 860px)').matches;

  // Заголовки разделов: слова выезжают снизу
  document.querySelectorAll('[data-split]').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w) {
      return '<span class="w" aria-hidden="true" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.06em"><span style="display:inline-block">' + w + '</span></span>';
    }).join(' ');
    gsap.from(h.querySelectorAll('.w > span'), {
      yPercent: 110, rotate: 4, duration: 1, ease: 'power4.out', stagger: 0.08,
      scrollTrigger: { trigger: h, start: 'top 88%' }
    });
  });

  // Первый экран
  var intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro.from('.hero__title .line > span', { yPercent: 115, duration: 1.2, stagger: 0.12 })
    .from('.hero .eyebrow, .hero__lead, .hero__actions, .hero__facts', { y: 30, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.8')
    .from('.hero__ring', { scale: 0.6, opacity: 0, duration: 1.6 }, 0);
  gsap.to('.hero__text', {
    yPercent: -18, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero__ring', {
    rotate: 140, scale: 1.3, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Бегущая строка движется вместе с прокруткой
  gsap.fromTo('.marquee__track', { xPercent: 0 }, {
    xPercent: -50, ease: 'none',
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  // Тёмные разделы раскрываются «шторкой» из скруглённой карточки
  var inset = mobile ? 'inset(0% 3% 0% 3% round 24px)' : 'inset(0% 4% 0% 4% round 40px)';
  document.querySelectorAll('.curtain').forEach(function (sec) {
    gsap.fromTo(sec, { clipPath: inset }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 25%', scrub: true }
    });
  });

  // Параллакс фото основателя
  var aboutImg = document.querySelector('[data-parallax] img');
  if (aboutImg) {
    gsap.fromTo(aboutImg, { yPercent: -10 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.about__photo', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  function batchIn(selector, vars) {
    window.ScrollTrigger.batch(selector, {
      start: 'top 90%',
      onEnter: function (els) { gsap.fromTo(els, vars, { x: 0, y: 0, opacity: 1, rotate: 0, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }); }
    });
    gsap.set(selector, vars);
  }
  batchIn('.price__item', { x: -40, opacity: 0 });
  batchIn('.gallery button', { y: 70, opacity: 0, scale: 0.96 });
  batchIn('.review', { y: 60, opacity: 0, rotate: 1.5 });
  batchIn('.master', { y: 80, opacity: 0 });
  batchIn('.faq details', { y: 24, opacity: 0 });

  window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
