
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  const toggleHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  toggleHeader();
  window.addEventListener('scroll', toggleHeader, { passive: true });

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  const revealItems = document.querySelectorAll('.reveal-up, .reveal-scale');
  if (revealItems.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animateCounter = (counter) => {
      const end = parseInt(counter.dataset.counter || '0', 10);
      const duration = 1400;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        counter.textContent = Math.floor(progress * end);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = end;
        }
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const magneticButtons = document.querySelectorAll('.magnetic');
  magneticButtons.forEach((button) => {
    button.addEventListener('mousemove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  });
});
