<?php get_header(); ?>

<main id="content" class="site-main">
  <div class="container content-layout">
    <div class="content-area">
      <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
          <?php get_template_part('templates/content', 'page'); ?>
        <?php endwhile; ?>
      <?php else : ?>
        <p><?php esc_html_e('No se encontró la página.', 'hello-trompo'); ?></p>
      <?php endif; ?>
    </div>

    <aside class="sidebar">
      <?php get_sidebar(); ?>
    </aside>
  </div>
</main>

<?php get_footer(); ?>

