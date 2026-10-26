(function () {
  'use strict';

  var BOOKING_URL = 'https://yandex.ru/web-maps/webview?mode=booking&booking[permalink]=171798453705&booking[standalone]=true&source=partner-cta';

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

  // Галерея и лайтбокс
  var lb = document.getElementById('lightbox');
  var lbImg = lb && lb.querySelector('img');
  function closeLb() { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; }
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

  // Плавное появление блоков
  if ('IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.section__head, .price__item, .master, .review, .booking__box, .about__grid > *, .contacts > *');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });

    // Прячем плавающую кнопку, когда виден блок записи
    var fab = document.querySelector('.fab');
    var booking = document.getElementById('booking');
    if (fab && booking) {
      var bookingVisible = false;
      var syncFab = function () { fab.classList.toggle('is-hidden', bookingVisible || window.scrollY < 480); };
      new IntersectionObserver(function (entries) {
        bookingVisible = entries[0].isIntersecting;
        syncFab();
      }).observe(booking);
      window.addEventListener('scroll', syncFab, { passive: true });
      syncFab();
    }
  }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
