<?php if (!defined('ABSPATH')) { exit; } ?>
<!DOCTYPE html>
<html lang="es" <?php language_attributes(); ?>>
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/png" href="/trompo/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Agencia digital con 10+ años acompañando marcas argentinas. Diseño, multimedia, desarrollo web, paid media y redes sociales como un sistema integrado.">
  <title>Trompo Agencia · Marketing para marcas que mueven el negocio</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet">
  <link rel="preload" href="/trompo/assets/fonts/neue-haas-grotesk-display-pro-cdnfonts/NeueHaasDisplayBold.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="/trompo/assets/fonts/neue-haas-grotesk-display-pro-cdnfonts/NeueHaasDisplayRoman.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="/trompo/assets/fonts/fonts.css">

  
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

  <div class="cursor" id="cursor"></div>
  <div class="cursor-trail" id="cursor-trail"></div>

  <!-- NAV -->
  <nav id="nav">
    <a href="/trompo/" class="nav-logo" data-cursor-hover>
      <img src="/trompo/assets/white.webp" alt="Trompo Agencia">
    </a>
    <div class="nav-links">
      <a href="/trompo/" class="nav-link active" data-cursor-hover>Inicio</a>
      <a href="/trompo/nosotros" class="nav-link" data-cursor-hover>Nosotros</a>
      <a href="#sistema" class="nav-link" data-cursor-hover>Sistema</a>
      <a href="/trompo/contactanos" class="nav-cta" data-cursor-hover>Hablemos →</a>
    </div>
  </nav>