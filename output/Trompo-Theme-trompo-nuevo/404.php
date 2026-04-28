<?php get_header(); ?>

<main id="content" class="site-main">
  <div class="container">
    <section class="error-404 not-found">
      <header class="page-header">
        <h1 class="page-title"><?php esc_html_e('Página no encontrada', 'hello-trompo'); ?></h1>
      </header>

      <div class="page-content">
        <p><?php esc_html_e('La página que buscás no existe o fue movida.', 'hello-trompo'); ?></p>
        <?php get_search_form(); ?>
      </div>
    </section>
  </div>
</main>

<?php get_footer(); ?>

