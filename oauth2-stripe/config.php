<?php

namespace Config;

// Do not touch this!
require 'default.php';
require __DIR__ . '/../Medoo.php';

use Medoo\Medoo;

//======================================================================
// PMSF - CONFIG FILE
// https://github.com/Glennmen/PMSF
//======================================================================

//-----------------------------------------------------
// OAUTH / STRIPE CONFIGS
//-----------------------------------------------------
$dbhost = '173.249.12.160';
$dbusername = 'tallypokemap';
$dbpassword = 'Butter19Free';
$dbname = 'Pokebot';
$dbtable = 'Tallahassee';

$donor_role_name = 'Gold Star Trainers';

$login_url = 'https://192.168.1.201:7770/login';
$subscribe_url = 'https://192.168.1.201:7770/subscribe';



//-----------------------------------------------------
// MAP SETTINGS
//-----------------------------------------------------

/* Location Settings */

$startingLat = 30.461732;                                           // Starting latitude
$startingLng = -84.280328;                                         // Starting longitude

/* Zoom and Cluster Settings */

$maxLatLng = 1;                                                     // Max latitude and longitude size (1 = ~110km, 0 to disable)
$maxZoomOut = 12;                                                   // Max zoom out level (11 ~= $maxLatLng = 1, 0 to disable, lower = the further you can zoom out)
$maxZoomIn = 50;                                                    // Max zoom in level 18
$disableClusteringAtZoom = 5;					    // Disable clustering above this value. 0 to disabel
$zoomToBoundsOnClick = 15;					    // Zoomlevel on clusterClick
$maxClusterRadius = 30;						    // The maximum radius that a cluster will cover from the central marker (in pixels).
$spiderfyOnMaxZoom = 'true';					    // Spiderfy cluster markers on click

/* Anti scrape Settings */
$enableCsrf = true;                                                 // Don't disable this unless you know why you need to :)
$sessionLifetime = 43200;                                           // Session lifetime, in seconds
$blockIframe = true;                                                // Block your map being loaded in an iframe


/* Map Title + Language */

$title = "TallyPokeMap";                                               // Title to display in title bar
$locale = "en";                                                     // Display language
$raidmapLogo = 'https://cdn.discordapp.com/icons/266738315380785152/4e6820231a78423b5cedb1c3cf06089e.png';                                                  // Upload logo to custom folder, leave '' for empty ( $raidmapLogo = 'custom/logo.png'; )

/* Google Maps Key */

$gmapsKey = "AIzaSyCAs8L3-CvXi54uK-98i61TBlZKf2b1sOU";                                                     // Google Maps API Key

/* Google Analytics */

$gAnalyticsId = "UA-106549734-1";                                                  // "" for empty, "UA-XXXXX-Y" add your Google Analytics tracking ID

/* Piwik Analytics */

$piwikUrl = "";
$piwikSiteId = "";

/* PayPal */

$paypalUrl = "https://tally.pokemap.org/subscribe";                                                  // PayPal donation URL, leave "" for empty

/* Discord */

$discordUrl = "";                     // Discord URL, leave "" for empty

/* Worldopole */

$worldopoleUrl = "";                                                // Link to Worldopole, leave "" for empty

/* StatsToggle */
$noStatsToggle = true;                                             // Enables or disables the stats button in the header.

/* MOTD */
$noMotd = true;
$motdTitle = "NOT WORKING";
$motdContent = "Use<br>http://www.tallypokequests.tk/<br>Gogogo!";

/* Favicon */
$faviconPath = '';                                                  // Upload favicon.ico to custom folder, leave '' for empty ( $faviconPath = 'custom/favicon.ico'; )


//-----------------------------------------------------
// FRONTEND SETTINGS
//-----------------------------------------------------

//if ($noNativeLogin === true && $noDiscordLogin == true ||  (($noNativeLogin === false || $noDiscordLogin === false) && !empty($_SESSION['user']->expire_timestamp) && $_SESSION['user']->expire_timestamp > time())) {

    /*
        THESE SETTINGS WILL BE APPLIED IF:
            - LOGIN IS DISABLED
            - LOGIN IS ENABLED AND THE USER IS LOGGED ON
    */

/* Marker Settings */
$noExcludeMinIV = false;                                        // true/false
$noMinIV = false;                                               // true/false
$noMinLevel = false;                                            // true/false
$noHighLevelData = false;                                       // true/false
$noRarityDisplay = false;                                       // true/false
$noWeatherIcons = true;
$noWeatherShadow = false;

/* Notification Settings */
$noNotifyPokemon = false;                                       // true/false
$noNotifyRarity = false;                                        // true/false
$noNotifyIv = false;                                            // true/false
$noNotifyLevel = false;                                         // true/false
$noNotifyRaid = false;                                          // true/false
$noNotifySound = false;                                         // true/false
$noCriesSound = false;                                          // true/false
$noNotifyBounce = false;                                        // true/false
$noNotifyNotification = false;                                  // true/false

/* Style Settings */
$iconNotifySizeModifier = 15;                                   // 0, 15, 30, 45

    /*
        THESE SETTINGS WILL BE APPLIED IF:
            - LOGIN IS ENABLED AND THE USER IS _NOT_ LOGGED ON
    */

/* Marker Settings */
$noPokemon = false;                                                 // true/false
$enablePokemon = 'true';                                            // true/false
$noPokemonNumbers = false;                                          // true/false
$noHidePokemon = false;                                             // true/false
$hidePokemon = '[10, 13, 16, 19, 21, 29, 32, 41, 46, 48, 50, 52, 56, 74, 77, 96, 111, 133,
                  161, 163, 167, 177, 183, 191, 194, 168]';         // [] for empty


/* Marker Settings */

$noPokemon = false;                                                 // true/false
$enablePokemon = 'true';                                            // true/false
$noPokemonNumbers = false;                                          // true/false
$noHidePokemon = false;                                             // true/false
$hidePokemon = '[10, 13, 16, 19, 21, 29, 32, 41, 46, 48, 50, 52, 56, 74, 77, 96, 111, 133,
                  161, 163, 167, 177, 183, 191, 194, 168]';         // [] for empty

$hidePokemonCoords = false;                                         // true/false

$excludeMinIV = '[131, 143, 147, 148, 149, 248]';                   // [] for empty

$minIV = '0';                                                       // "0" for empty or a number
$minLevel = '0';                                                    // "0" for empty or a number

$noBigKarp = true;                                                 // true/false
$noTinyRat = true;                                                 // true/false

$noGyms = false;                                                    // true/false
$enableGyms = 'false';                                              // true/false
$noGymSidebar = true;                                              // true/false
$gymSidebar = 'false';                                               // true/false
$noTrainerName = false;                                             // true/false
$noExEligible = false;                                              // true/false
$exEligible = 'false';                                              // true/false

$noRaids = false;                                                   // true/false
$enableRaids = 'true';                                             // true/false
$activeRaids = 'false';                                             // true/false
$minRaidLevel = 1;
$maxRaidLevel = 5;

$noPokestops = false;                                               // true/false
$enablePokestops = 'false';                                         // true/false
$enableLured = 0;                                                   // O: all, 1: lured only
$noQuests = false;                                                  // true/false
$enableQuests = 'true';

$noScannedLocations = false;                                        // true/false
$enableScannedLocations = 'false';                                  // true/false

$noSpawnPoints = false;                                             // true/false
$enableSpawnPoints = 'false';                                       // true/false

$noRanges = false;                                                  // true/false
$enableRanges = 'false';                                            // true/false

/* Location & Search Settings */

$noSearchLocation = false;                                          // true/false

$noStartMe = false;                                                 // true/false
$enableStartMe = 'true';                                           // true/false

$noStartLast = false;                                               // true/false
$enableStartLast = 'false';                                         // true/false

$noFollowMe = false;                                                // true/false
$enableFollowMe = 'false';                                          // true/false

$noSpawnArea = false;                                               // true/false
$enableSpawnArea = 'false';                                         // true/false

/* Notification Settings */

$notifyPokemon = '[201]';                                           // [] for empty

$notifyRarity = '[]';                                               // "Common", "Uncommon", "Rare", "Very Rare", "Ultra Rare"

$notifyIv = '""';                                                   // "" for empty or a number

$notifyLevel = '""';                                                // "" for empty or a number

$notifyRaid = 0;                                                    // O to disable

$notifySound = 'false';                                             // true/false

$criesSound = 'false';                                              // true/false

$notifyBounce = 'true';                                             // true/false

$notifyNotification = 'true';                                       // true/false

/* Style Settings */

$copyrightSafe = false;
//$iconRepository = 'https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/';
//$iconRepository = 'https://raw.githubusercontent.com/whitewillem/PogoAssets/resized/no_border/';
$iconRepository = 'https://raw.githubusercontent.com/whitewillem/PogoAssets/resized/icons_large/';
$noMapStyle = false;                                                // true/false
$mapStyle = 'openstreetmap';                                    // roadmap, satellite, hybrid, nolabels_style, dark_style, style_light2, style_pgo, dark_style_nl, style_pgo_day, style_pgo_night, style_pgo_dynamic

$noDirectionProvider = false;                                       // true/false
$directionProvider = 'google';                                      // google, waze, apple, bing, google_pin

$noIconSize = false;                                                // true/false
$iconSize = 0;                                                      // -8, 0, 10, 20

$noIconNotifySizeModifier = false;                                  // true/false | Increase size of notified Pokemon

$noGymStyle = false;                                                // true/false
$gymStyle = 'ingame';                                               // ingame, shield

$noLocationStyle = false;                                           // true/false
$locationStyle = 'none';                                            // none, google, red, red_animated, blue, blue_animated, yellow, yellow_animated, pokesition, pokeball

$osmTileServer = 'tile.openstreetmap.org';                          // osm tile server (no trailing slash)

$triggerGyms = '[]';                                                // Add Gyms that the OSM-Query doesn't take care of like '["gym_id", "gym_id"]'
$onlyTriggerGyms = false;                                           // Only show EX-Gyms that are defined in $triggerGyms
$noExGyms = false;                                                  // Do not display EX-Gyms on the map
$noParkInfo = false;                                                // Do not display Park info on the map

/* Share links */
$noWhatsappLink = true;
//-----------------------------------------------
// Raid API
//-----------------------------------------------------

$raidApiKey = '';                                                   // Raid API Key, '' to deny access
$sendRaidData = false;                                              // Send Raid data, false to only send gym data

//-----------------------------------------------------
// Manual Submissions
//-----------------------------------------------------
$hideIfManual = false;
$noManualRaids = true;						   						// Enable/Disable ManualRaids permanently ( Comment this line if you want to use the block below )
$noDiscordSubmitLogChannel = true;                                  // Send webhooks to discord channel upon submission
$submitMapUrl = '';
$discordSubmitLogChannelUrl = 'https://discordapp.com/api/webhooks/<yourCHANNELhere>';  // Sends gym/pokestop submit & pokestop rename directly to discord
//$currentTime = (int) date('G');				   					// Uncomment this block to deny Raid submissions over night
//
//if ($currentTime >= 6 && $currentTime < 23) {                     // noManualRaids = true between 23:00 and 06:00. Adjust hours if needed
//
//	        $noManualRaids = false;
//} else {
//	        $noManualRaids = true;
//}

$noManualPokemon = true;
$pokemonTimer = 900;                                                // Time in seconds before a submitted Pokémon despawns.
$noManualGyms = false;
$noManualPokestops = false;
$noRenamePokestops = true;
$noConvertPokestops = true;
$noManualQuests = true;

//-----------------------------------------------------
// Ingress portals
//-----------------------------------------------------
$enablePortals = 'false';
$noPortals = true;
$noDeletePortal = true;

$pokemonReportTime = false;
$pokemonToExclude = [];

$noDeleteGyms = true;
$noDeletePokestops = true;

$raidBosses = [353,355,361,403,200,215,281,302,303,68,94,210,319,105,176,229,248,359,487];

$sendWebhook = true;
$webhookUrl = ['127.0.0.1:4002'];                             //['url-1','url-2']

//---------------------------------------------------
// Quest Webhooks
//---------------------------------------------------
$sendQuestWebhook = true;                      // Experimental use only
$questWebhookUrl = 'https://discordapp.com/api/webhooks/461571053097844747/_vYfG0LhiiBxfCC9pK6R4E_3TKlHxHPe_n1J9dODHCXVz2FJM9k-p3O3S30V-uEHdcW-';                        // Experimental use only
$webhookSystem = ['poracle'];				// Supported either 'pokealarm' or 'poracle'

$manualFiveStar = [
    'webhook' => false,						    // If set to false no webhooks will be send on raid_cron.php
    'pokemon_id' => 150,
    'cp' => 60000,
    'move_1' => null,
    'move_2' => null,
    'form' => 0
];

//-----------------------------------------------
// Search
//-----------------------------------------------------

$noSearch = false;
$noSearchPokestops = false;     //Wont work if noSearch = false
$noSearchGyms = false;          //Wont work if noSearch = false
$noSearchManualQuests = false;  //Wont work if noSearch = false
$noSearchNests = false;
$defaultUnit = "mi";                                            // mi/km
//-----------------------------------------------
// Community
//-----------------------------------------------------
$noCommunity = true;
$enableCommunities = 'false';
$noAddNewCommunity = false;
$noDeleteCommunity = false;
$noEditCommunity = false;

//-----------------------------------------------
// Nests
//-----------------------------------------------------
$noNests = false;                                                   // true/false
$enableNests = 'false';                                             // true/false
$noManualNests = false;
$noDeleteNests = false;
$nestVerifyLevel = 1;						    // 1 = Verified 2 = 1 + Unverified 3 = 1 + 2 + Revoked 4 = Get all nests
$deleteNestsOlderThan = 42;					    // days after not updated nests are removed from database by nest cron
$migrationDay = strtotime('19 Septemeber 2018');                          // Adjust day value after non consitent 14 day migration
$noAddNewNests = false;
$excludeNestMons = [2,3,5,6,8,9,11,12,14,15,17,18,20,22,24,26,28,29,30,31,32,33,34,36,38,40,42,44,45,49,51,53,55,57,59,61,62,64,65,67,68,70,71,73,75,76,78,80,82,83,85,87,88,89,91,93,94,97,99,101,103,105,106,107,108,109,110,112,113,114,115,117,119,121,122,128,130,131,132,134,135,136,137,139,142,143,144,145,146,147,148,149,150,151,153,154,156,157,159,160,162,164,166,168,169,171,172,173,174,175,176,178,179,180,181,182,184,186,188,189,192,195,196,197,199,201,204,205,207,208,210,212,214,217,219,221,222,224,225,229,230,232,233,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,253,254,256,257,259,260,262,264,266,267,268,269,270,271,272,274,275,277,279,280,281,282,284,286,287,288,289,290,291,292,294,295,297,298,301,303,305,306,308,310,313,314,317,319,321,323,324,326,327,328,329,330,331,332,334,335,336,337,338,340,342,344,346,348,349,350,351,352,354,356,357,358,359,360,361,362,364,365,366,367,368,369,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386];
$nestCoords = array(array('lat1' => 30.541736, 'lng1' => -84.38298, 'lat2' => 30.369899, 'lng2' => -84.098746));
//,array(    'lat1' => 42.8529250952743,'lng1' => -88.1292951067752,'lat2' => 41.7929306950085,'lng2' => -87.5662457903689));

$noNestPolygon = false;
$enableNestPolygon = 'false';
$nestGeoJSONfile = 'custom/nest.json';

//-----------------------------------------------------
// Areas
//-----------------------------------------------------

$noAreas = false;
$areas = [[30.461732,-84.280328,15,"Tallahasse"], [29.6556896,-82.335535,15,"Gainesville"], [32.377714,-86.301334,15,"Montgomery"], [34.0407589,-118.0703891,15,"San Gabriel"], [32.463863, -84.994805,15,"Columbus"]];

//-----------------------------------------------------
// Weather Config
//-----------------------------------------------------

$noWeatherOverlay = true;                                          // true/false
$enableWeatherOverlay = 'false';                                    // true/false

$weatherColors = [
    'grey',                                                         // no weather
    '#fdfd96',                                                      // clear
    'darkblue',                                                     // rain
    'grey',                                                         // partly cloudy
    'darkgrey',                                                     // cloudy
    'purple',                                                       // windy
    'white',                                                        // snow
    'black'                                                         // fog
];

//-----------------------------------------------------
// DATA MANAGEMENT
//-----------------------------------------------------

// Clear pokemon from database this many hours after they disappear (0 to disable)
// This is recommended unless you wish to store a lot of backdata for statistics etc!

$purgeData = 0;


//-----------------------------------------------------
// DEBUGGING
//-----------------------------------------------------

// Do not enable unless requested

$enableDebug = false;

//-----------------------------------------------------
// DATABASE CONFIG
//-----------------------------------------------------

$map = "rdm";                                                   // monocle/rm
$fork = "beta";                                                  // default/asner/sloppy/alternate

$db = new Medoo([// required
    'database_type' => 'mysql',                                     // mysql/mariadb/pgsql/sybase/oracle/mssql/sqlite
    'database_name' => 'rdmdb',
    'server' => '173.249.12.160',
//    'server' => '73.118.75.200',
    'username' => 'tallypokemap',
    'password' => 'Butter19Free',
    'charset' => 'utf8',

    // [optional]
//    'port' => 10101,
    'port' => 3306,
	// Comment out if not needed, just add // in front!
    //'socket' => /path/to/socket/,
]);

$manualdb = new Medoo([
    'database_type' => 'mysql',
    'database_name' => 'manualdb',
    'server' => '173.249.12.160',
    'username' => 'tallypokemap',
    'password' => 'Butter19Free',
    'charset' => 'utf8',
    'port' => 3306,
]);
