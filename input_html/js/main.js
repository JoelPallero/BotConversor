/* ==========================================================================
   SICAM v3 — Corporate Global
   JS · scroll header + reveals · Trompo Agencia 2026
   ========================================================================== */

(function() {
  'use strict';

  // ====== HEADER ON SCROLL ======
  const header = document.querySelector('.header');
  if (header) {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ====== REVEAL ON SCROLL ======
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));

  // ====== SMOOTH SCROLL CON OFFSET HEADER ======
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 0;
        const y = el.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ====== FORM PREVENT SUBMIT EN DEMO ======
  const form = document.querySelector('form[data-demo]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Solicitud recibida — versión demo.\nEn producción se conecta a CRM/email.');
    });
  }

})();
