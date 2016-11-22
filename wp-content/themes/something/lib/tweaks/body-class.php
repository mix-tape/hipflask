<?php
// --------------------------------------------------------------------------
//
//   Modify Body Classes
//
// --------------------------------------------------------------------------

function hibiki_body_classes($classes) {

  // --------------------------------------------------------------------------
  //   Add home / internal body class
  // --------------------------------------------------------------------------

  $classes[] = is_front_page() ? 'home' : 'internal';


  // --------------------------------------------------------------------------
  //   Add post/page slug
  // --------------------------------------------------------------------------

  global $post;

  if (!is_home() && is_single() && $post) {
    $classes[] = get_post_type($post->ID) . '-' . $post->post_name;
  }


  // --------------------------------------------------------------------------
  //   Remove unnecessary classes
  // --------------------------------------------------------------------------

  $home_id_class = 'page-id-' . get_option('page_on_front');

  $remove_classes = array(
    'page-template-default',
    $home_id_class
  );

  $classes = array_diff($classes, $remove_classes);

  return $classes;

}

add_filter('body_class', 'hibiki_body_classes', 10, 1);
