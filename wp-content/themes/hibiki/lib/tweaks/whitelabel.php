<?php
// --------------------------------------------------------------------------
//
//   White Label Wordpress
//
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
//   Birdbrain settings - Admin options page
// --------------------------------------------------------------------------

if ( function_exists('acf_add_options_page') )
{

  acf_add_options_page(array(
    'page_title'   => 'Birdbrain Settings',
    'menu_title'  => 'Birdbrain',
    'menu_slug'   => 'birdbrain',
    'icon_url'    =>  get_template_directory_uri() . '/lib/images/birdbrain-icon.png',
    'capability'  => 'edit_posts',
    'redirect'    => true
  ));

  acf_add_options_sub_page(array(
    'page_title'   => 'Contact Information',
    'menu_title'   => 'Contact Information',
    'parent_slug'   => 'birdbrain',
  ));

  acf_add_options_sub_page(array(
    'page_title'   => 'SEO & Social',
    'menu_title'   => 'SEO & Social',
    'parent_slug'   => 'birdbrain',
  ));
}


// --------------------------------------------------------------------------
//   Change Wordpress admin login logo
// --------------------------------------------------------------------------

function hibiki_login_head()
{
  echo "
  <style>
  body.login #login h1 a {
    background: url('".get_bloginfo('template_url')."/lib/images/birdbrain.svg') no-repeat scroll center top transparent;
    background-size: contain;
    height: 90px;
    width: 100%;
    margin-bottom: 20px;
  }
  </style>
  ";
}

add_action("login_head", "hibiki_login_head");


// --------------------------------------------------------------------------
//   Admin footer modification
// --------------------------------------------------------------------------

function hibiki_remove_footer_admin ()
{
  echo '<span id="footer-thankyou">Developed by <a href="https://www.birdbrain.com.au" target="_blank">Birdbrain</a></span>';
}

add_filter('admin_footer_text', 'hibiki_remove_footer_admin');


// --------------------------------------------------------------------------
//   Color scheme
// --------------------------------------------------------------------------

function set_default_admin_color()
{

  $args = array(
    'ID' => get_current_user_id(),
    'admin_color' => 'coffee'
  );

  wp_update_user( $args );
  remove_action( 'admin_color_scheme_picker', 'admin_color_scheme_picker' );
}

add_action('admin_init', 'set_default_admin_color');
