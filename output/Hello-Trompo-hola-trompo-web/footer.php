<?php if (!defined('ABSPATH')) { exit; } ?>
<footer>
    <div class="footer-top">
      <div>
        <div class="footer-brand-mark">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="3.5" fill="#E8B73A"/><circle cx="18" cy="12" r="3.5" fill="#E8B73A"/><circle cx="12" cy="18" r="3.5" fill="#E8B73A"/><circle cx="6" cy="12" r="3.5" fill="#E8B73A"/><circle cx="12" cy="12" r="2.5" fill="#E8458F"/></svg>
          Trompo
        </div>
        <div class="footer-tagline">Vanguardia digital · Córdoba</div>
        <p class="footer-desc">Marketing para marcas que mueven el negocio. Diez años de operación desde Córdoba con clientes en toda Argentina.</p>
      </div>
      <div>
        <h4 class="footer-col-h">Institucional</h4>
        <ul class="footer-list">
          <li><a href="/trompo/" data-cursor-hover>Inicio</a></li>
          <li><a href="/trompo/nosotros" data-cursor-hover>Nosotros</a></li>
          <li><a href="/trompo/contactanos" data-cursor-hover>Contactanos</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer-col-h">Sistema</h4>
        <ul class="footer-list">
          <li><a href="#" data-cursor-hover>Diseño</a></li>
          <li><a href="#" data-cursor-hover>Multimedia</a></li>
          <li><a href="#" data-cursor-hover>Desarrollo Web</a></li>
          <li><a href="#" data-cursor-hover>Paid Media</a></li>
          <li><a href="#" data-cursor-hover>Redes Sociales</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer-col-h">Horarios</h4>
        <ul class="footer-list">
          <li>Lunes a Viernes</li>
          <li>09:00 a 18:00 hs</li>
          <li>&nbsp;</li>
          <li><strong  class="tc-inline-hola-trompo-web-5">Córdoba, Argentina</strong></li>
        </ul>
      </div>
    </div>
    <div class="footer-base">
      <span>© 2026 Trompo Agencia · Sistema digital v.2030.04</span>
      <a href="mailto:somos@trompoagencia.com" data-cursor-hover>somos@trompoagencia.com</a>
    </div>
  </footer>

  <!-- DOCK -->
  <div class="dock">
    <div class="dock-status">
      <span class="live-dot"></span>
      <span>Online</span>
    </div>
    <a href="#sistema" class="dock-link" data-cursor-hover>Sistema</a>
    <a href="#cartera" class="dock-link" data-cursor-hover>Cartera</a>
    <a href="/trompo/contactanos" class="dock-cta" data-cursor-hover>Hablemos →</a>
  </div>

  <!-- SCROLL TOP -->
  <button class="scroll-top-button" id="scrollTop" aria-label="Scroll to top">
    <svg width="18" height="18" viewBox="0 0 23 24" fill="none"><path d="M11.6526 22.231L11.6526 1.83985M11.6526 1.83985L1.62695 12.0354M11.6526 1.83985L21.6782 12.0354" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>

  <script>
    // CURSOR
    const cursor = document.getElementById('cursor');
    const trail = document.getElementById('cursor-trail');
    let mx = 0, my = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    function animTrail() {
      tx += (mx - tx) * 0.18;
      ty += (my - ty) * 0.18;
      trail.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
      requestAnimationFrame(animTrail);
    }
    animTrail();
    document.querySelectorAll('[data-cursor-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // REVEAL
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // SCROLL TOP
    const btn = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // SLIDER
    (function initSlider() {
      const sliderEl = document.getElementById('slider');
      if (!sliderEl) return;
      const slides = sliderEl.querySelectorAll('.slider-image');
      const indicators = document.querySelectorAll('.slider-indicators .slider-indicator');
      const counter = document.getElementById('slider-counter');
      if (!slides.length || !indicators.length) return;

      let current = 0;
      const total = slides.length;
      const DURATION = 5000;

      function update(i) {
        slides[current].classList.remove('active');
        indicators[current].classList.remove('active');
        current = i;
        slides[current].classList.add('active');
        indicators[current].classList.add('active');
        if (counter) counter.textContent = `0${current+1} / 0${total}`;
        // Reset progress animation on the active indicator
        const active = indicators[current];
        active.style.animation = 'none';
        // Force reflow
        void active.offsetWidth;
        active.style.animation = '';
      }
      function nextSlide() { update((current + 1) % total); }

      let timer = setInterval(nextSlide, DURATION);
      indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => {
          clearInterval(timer);
          update(i);
          timer = setInterval(nextSlide, DURATION);
        });
      });
    })();
  </script>
<?php wp_footer(); ?>
</body>
</html>
