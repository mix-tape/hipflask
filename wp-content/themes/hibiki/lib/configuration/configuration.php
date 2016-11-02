<?php
// --------------------------------------------------------------------------
//
//  Theme Configuration
//    General theme hooks and filters
//
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
//   Enable theme features
// --------------------------------------------------------------------------

add_theme_support( 'rewrite-urls' );          // Enable URL rewrites
add_theme_support( 'h5bp-htaccess' );         // Enable HTML5 Boilerplate's .htaccess
add_theme_support( 'automatic-feed-links' );
add_theme_support( 'menus' );
add_theme_support( 'title-tag' );
add_theme_support( 'html5', array('search-form', 'comment-form', 'comment-list', 'caption', 'gallery') );


// --------------------------------------------------------------------------
// Image sizes
// --------------------------------------------------------------------------

add_filter( 'jpeg_quality', create_function( '', 'return 80;' ) );
add_filter( 'wp_editor_set_quality', create_function( '', 'return 80;' ) );

set_post_thumbnail_size( 300, 300, true );
add_image_size( 'hero', 1920, 900, true );


update_option('large_size_w', 650);
update_option('large_size_h', 650);
update_option('large_crop', 1);


update_option('medium_size_w', 450);
update_option('medium_size_h', 450);
update_option('medium_crop', 1);


// --------------------------------------------------------------------------
// Media uploader image sizes
// --------------------------------------------------------------------------

update_option('image_default_align', 'none' );
update_option('image_default_link_type', 'none' );
update_option('image_default_size', 'large' );


function hibiki_add_custom_image_sizes( $imageSizes ) {

  $my_sizes = array(
    'hero' => 'Hero',
  );

  return array_merge( $imageSizes, $my_sizes );

}

add_filter( 'image_size_names_choose', 'hibiki_add_custom_image_sizes' );


// --------------------------------------------------------------------------
// Add primary navigation
// --------------------------------------------------------------------------

register_nav_menus( array(
  'primary' => 'Primary Navigation',
) );


// --------------------------------------------------------------------------
// Add theme sidebars
// --------------------------------------------------------------------------

register_sidebar(array(
  'name'          => 'Primary Widget Area',
  'id'            => 'primary-widget-area',
  'before_widget' => '<section id="%1$s" class="widget %2$s">',
  'after_widget'  => '</section>',
  'before_title'  => '<h4 class="widget-title">',
  'after_title'   => '</h4>',
));
