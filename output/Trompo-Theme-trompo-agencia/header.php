<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Trompo Agencia · Marketing para marcas que mueven el negocio</title>
<meta name="description" content="Agencia digital con 10+ años acompañando marcas argentinas. Diseño, multimedia, desarrollo web, paid media y redes sociales como un sistema integrado.">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@200;300;400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600;12..96,700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">


    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div class="cursor" id="cursor"></div>
<div class="cursor-trail" id="cursor-trail"></div>
<div class="cursor-coord" id="cursor-coord">x:0 / y:0</div>

<div class="bg-glow"></div>

<!-- SPLASH -->
<div class="splash" id="splash">
    <div class="splash-inner">
        <div class="splash-mark">Trompo</div>
        <div class="splash-meta">
            <span>Sistema online</span>
            <span>v.2030.04</span>
            <span>Córdoba · AR</span>
        </div>
        <div class="splash-progress"></div>
    </div>
</div>

<!-- STATUS BAR -->
<div class="status-bar">
    <div class="status-left">
        <div class="status-item">
            <span class="dot"></span>
            <span>Agencia online</span>
        </div>
        <div class="status-divider"></div>
        <div class="status-item"><span>Operativo · Lun–Vie · 09–18 hs</span></div>
        <div class="status-divider"></div>
        <div class="status-item"><span>10+ años · 80+ marcas</span></div>
    </div>
    <div class="status-right">
        <div class="status-item"><span>CBA · AR</span></div>
        <div class="status-divider"></div>
        <div class="status-item"><span class="status-clock" id="status-clock">00:00:00</span></div>
    </div>
</div>

<!-- NAV -->
<nav id="nav">
    <a href="#" class="logo" data-cursor-hover>
        <span class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="3.5" fill="#E8B73A"/>
                <circle cx="18" cy="12" r="3.5" fill="#E8B73A"/>
                <circle cx="12" cy="18" r="3.5" fill="#E8B73A"/>
                <circle cx="6" cy="12" r="3.5" fill="#E8B73A"/>
                <circle cx="12" cy="12" r="2.5" fill="#E8458F"/>
            </svg>
        </span>
        Trompo <small>Agencia digital</small>
    </a>
    <div class="nav-links">
        <a href="#sistema" class="nav-link" data-cursor-hover>Sistema</a>
        <a href="#verticales" class="nav-link" data-cursor-hover>Verticales</a>
        <a href="#equipo" class="nav-link" data-cursor-hover>Equipo</a>
        <a href="#cartera" class="nav-link" data-cursor-hover>Cartera</a>
        <a href="#contacto" class="nav-cta" data-cursor-hover>Hablemos →</a>
    </div>
</nav>