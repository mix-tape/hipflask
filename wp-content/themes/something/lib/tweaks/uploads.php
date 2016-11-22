<?php

// --------------------------------------------------------------------------
//   Root Relative Upload Directory
// --------------------------------------------------------------------------

add_filter('wp_get_attachment_image_src', 'hibiki_simple_upload_directory');

function hibiki_simple_upload_directory( $image )
{
  $image[0] = str_replace('wordpress/../', '', $image[0]);

  return $image;
}
