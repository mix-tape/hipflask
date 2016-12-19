<?php

/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, and ABSPATH. You can find more information by visiting
 * {@link http://codex.wordpress.org/Editing_wp-config.php Editing wp-config.php}
 * Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// --------------------------------------------------------------------------
//   Check secrets.json for database details for the current enironment
// --------------------------------------------------------------------------

define('ENVIRONMENT', getenv('ENVIRONMENT'));
$environment = (ENVIRONMENT ? ENVIRONMENT : 'development');

switch ($environment) {

	case 'development':
		$json_file_location = dirname(__FILE__) . '/secrets.json';
		break;

	// Obscure secrets on environments other than development

	default:
		$json_file_location = dirname(__FILE__) . '/../../shared/secrets.json';
		break;
}

$json_file = file_get_contents($json_file_location);
$secrets = json_decode( $json_file );

define('DB_NAME', $secrets->$environment->db_name);
define('DB_USER', $secrets->$environment->db_user);
define('DB_PASSWORD', $secrets->$environment->db_password);
define('DB_HOST', $secrets->$environment->db_host);


// --------------------------------------------------------------------------
//   Dynamic site URL's
// --------------------------------------------------------------------------

define( 'WP_HOME', 'http://' . $_SERVER['HTTP_HOST']);
define( 'WP_SITEURL', WP_HOME . '/wordpress' );


// --------------------------------------------------------------------------
//   Content Directory
// --------------------------------------------------------------------------

define( 'UPLOADS', '../assets' );

if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

define( 'WP_CONTENT_DIR', ABSPATH . '../wp-content');
define( 'WP_CONTENT_URL', WP_HOME . '/wp-content');


// --------------------------------------------------------------------------
//   Theme
// --------------------------------------------------------------------------

define('WP_DEFAULT_THEME', $secrets->project);


// --------------------------------------------------------------------------
//   Disable plugin and theme updates
// --------------------------------------------------------------------------

define('DISALLOW_FILE_MODS', true);


/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

define('AUTH_KEY',         'Un-j;-+Cv=MR{S{ :;gogdWz03kwik-?2*cw#HXR2#y#Fm0dj@^3K|?NQT2]B2aa');
define('SECURE_AUTH_KEY',  '9`zdCM8^Zm||FZn3$m9z6(HS%_NVoOfa?+Bi%E$?}%2_Z]<942$+[.B{v8?N sE:');
define('LOGGED_IN_KEY',    '-?8(ZG%SF$WA2^@OiP%*? Vome.<&+B>x6@E2~W8wZ`H-8d[<6|`c/k8cM|>#PjJ');
define('NONCE_KEY',        'FFw7/;n#ehC/<=L-}X $oJKyg96xSSj_ZlwBlOY-88E$8(|2r9ZTZz0-%%~/XfIT');
define('AUTH_SALT',        'M+v6k3oY-_+W~}=qp7mz?a8#-V%>7WZW4yNQ#(!l#B>F$*sRM:DnPi!;Q7T7jY/H');
define('SECURE_AUTH_SALT', '|V[rAfuIKEe.!vmq-?41lY4l3pS4GG4|fK594d1pCh&|ij=0g|w5-Kuh0=hFC$#H');
define('LOGGED_IN_SALT',   'R}6H)M=&zJayi>~6whaAB/@<^5+,)N-;+`4+=:v(SeuGM`9fj5,WM2+^}jPXj~:y');
define('NONCE_SALT',       '!ve~15EKcU<#6XmE-2ss^ex^i*MN> m,=H(Qh7$Gt)l-JH2b+96~g;TwtFxS-D9n');


/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', true);

/* That's all, stop editing! Happy blogging. */


/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
