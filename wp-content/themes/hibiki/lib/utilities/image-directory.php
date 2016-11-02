<?php

// --------------------------------------------------------------------------
//   Image Directory
// --------------------------------------------------------------------------

function get_image_directory()
{
  return get_bloginfo('template_url') . '/assets/images/';
}

function image_directory()
{
  echo get_image_directory();
}
