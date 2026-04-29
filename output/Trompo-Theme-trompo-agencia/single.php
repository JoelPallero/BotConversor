<?php get_header(); ?>

<main id="content" class="site-main">
  <div class="container content-layout">
    <div class="content-area">
      <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
          <article <?php post_class('entry entry-single'); ?>>
            <header class="entry-header">
              <h1 class="entry-title"><?php the_title(); ?></h1>
              <div class="entry-meta">
                <time datetime="<?php echo esc_attr(get_the_date('c')); ?>">
                  <?php echo esc_html(get_the_date()); ?>
                </time>
              </div>
            </header>

            <div class="entry-content">
              <?php the_content(); ?>
            </div>

            <footer class="entry-footer">
              <?php the_tags('<div class="entry-tags">', ' ', '</div>'); ?>
            </footer>
          </article>

          <?php
          if (comments_open() || get_comments_number()) {
            comments_template();
          }
          ?>
        <?php endwhile; ?>
      <?php else : ?>
        <p><?php esc_html_e('No se encontró el contenido.', 'hello-trompo'); ?></p>
      <?php endif; ?>
    </div>

    <aside class="sidebar">
      <?php get_sidebar(); ?>
    </aside>
  </div>
</main>

<?php get_footer(); ?>

