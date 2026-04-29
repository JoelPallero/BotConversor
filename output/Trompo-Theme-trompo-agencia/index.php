<?php get_header(); ?>

<main id="content" class="site-main">
  <div class="container content-layout">
    <div class="content-area">
      <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
          <article <?php post_class('entry'); ?>>
            <header class="entry-header">
              <h1 class="entry-title">
                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
              </h1>
            </header>

            <div class="entry-content">
              <?php the_excerpt(); ?>
            </div>
          </article>
        <?php endwhile; ?>

        <nav class="pagination">
          <?php the_posts_pagination(); ?>
        </nav>
      <?php else : ?>
        <p><?php esc_html_e('No se encontraron contenidos.', 'hello-trompo'); ?></p>
      <?php endif; ?>
    </div>

    <aside class="sidebar">
      <?php get_sidebar(); ?>
    </aside>
  </div>
</main>

<?php get_footer(); ?>