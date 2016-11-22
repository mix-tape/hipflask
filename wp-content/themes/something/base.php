<?php
// --------------------------------------------------------------------------
//
//   Base layout
//
// --------------------------------------------------------------------------

get_template_part('templates/layout/head'); ?>

<body <?php body_class(); ?>>

<?php get_template_part('templates/layout/header');?>

<?php include roots_template_path(); ?>

<?php get_template_part('templates/layout/footer'); ?>

<?php wp_footer(); ?>

</body>
</html>
