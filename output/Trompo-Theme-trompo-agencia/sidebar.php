<?php
if (!is_active_sidebar('sidebar-1')) {
  return;
}
?>

<div class="sidebar-widgets">
  <?php dynamic_sidebar('sidebar-1'); ?>
</div>

