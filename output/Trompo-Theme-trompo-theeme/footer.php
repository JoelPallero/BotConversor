<footer>
    <div class="footer-top">
        <div class="footer-brand-col">
            <div class="footer-logo">
                <span class="brand-mark">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="6" r="3.5" fill="#E8B73A"/>
                        <circle cx="18" cy="12" r="3.5" fill="#E8B73A"/>
                        <circle cx="12" cy="18" r="3.5" fill="#E8B73A"/>
                        <circle cx="6" cy="12" r="3.5" fill="#E8B73A"/>
                        <circle cx="12" cy="12" r="2.5" fill="#E8458F"/>
                    </svg>
                </span>
                Trompo
            </div>
            <div class="footer-tagline">Vanguardia digital · Córdoba</div>
            <p class="footer-desc">
                Marketing para marcas que mueven el negocio. Diez años de operación desde Córdoba con clientes en toda Argentina.
            </p>
        </div>

        <div>
            <h4 class="footer-col-h">Institucional</h4>
            <ul class="footer-list">
                <li><a href="#" data-cursor-hover>Inicio</a></li>
                <li><a href="#nosotros" data-cursor-hover>Nosotros</a></li>
                <li><a href="#contacto" data-cursor-hover>Contactanos</a></li>
                <li><a href="#" data-cursor-hover>Términos</a></li>
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
                <li><strong  class="tc-inline-trompo-theeme-1">Córdoba, Argentina</strong></li>
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
    <a href="#contacto" class="dock-cta" data-cursor-hover>Hablemos →</a>
</div>

<script>
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('gone');
    }, 1500);
});

const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
const coord = document.getElementById('cursor-coord');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    coord.style.transform = `translate(${mouseX + 18}px, ${mouseY + 18}px)`;
    coord.textContent = `x:${mouseX.toString().padStart(4,'0')} / y:${mouseY.toString().padStart(4,'0')}`;
});

function animateTrail() {
    trailX += (mouseX - trailX) * 0.18;
    trailY += (mouseY - trailY) * 0.18;
    trail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateTrail);
}
animateTrail();

document.querySelectorAll('[data-cursor-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

function updateClock() {
    const now = new Date();
    const opts = { timeZone: 'America/Argentina/Buenos_Aires', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const time = new Intl.DateTimeFormat('es-AR', opts).format(now);
    document.getElementById('status-clock').textContent = time + ' ART';
}
updateClock();
setInterval(updateClock, 1000);

const glitchTarget = document.getElementById('glitch-target');
setInterval(() => {
    if (Math.random() > 0.5) {
        glitchTarget.classList.add('glitch');
        setTimeout(() => glitchTarget.classList.remove('glitch'), 300);
    }
}, 4000);

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const counters = document.querySelectorAll('.counter');
const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            let current = 0;
            const increment = target / 35;
            const update = () => {
                current += increment;
                if (current < target) {
                    el.textContent = Math.floor(current);
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target;
                }
            };
            update();
            counterObs.unobserve(el);
        }
    });
}, { threshold: 0.5 });

counters.forEach(c => counterObs.observe(c));
</script>

<?php wp_footer(); ?>
</body>
</html>
