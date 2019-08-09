delete require.cache[require.resolve('../embeds/invasion.js')];
const Send_Invasion = require('../embeds/invasion.js');
const Discord = require('discord.js');

module.exports.run = async (MAIN, invasion, main_area, sub_area, embed_area, server, timezone, role_id) => {

  if (MAIN.debug.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Received a Pokestop.'); }

  // FILTER FEED TYPE FOR EGG, BOSS, OR BOTH
  let type = 'Invaded', stop_id = invasion.pokestop_id;

  switch (invasion.grunt_type) {
    case 1: type = 'Blanche'; break;
    case 2: type = 'Candela'; break;
    case 3: type = 'Spark'; break;
    case 4: type = 'Male Grunt'; break;
    case 5: type = 'Female Grunt'; break;
    case 6: type = 'Bug - Female Grunt'; break;
    case 7: type = 'Bug - Male Grunt'; break;
    case 8: type = 'Darkness - Female Grunt'; break;
    case 9: type = 'Darkness - Male Grunt'; break;
    case 10: type = 'Dark - Female Grunt'; break;
    case 11: type = 'Dark - Male Grunt'; break;
    case 12: type = 'Dragon - Female Grunt'; break;
    case 13: type = 'Dragon - Male Grunt'; break;
    case 14: type = 'Fairy - Female Grunt'; break;
    case 15: type = 'Fairy - Male Grunt'; break;
    case 16: type = 'Fighting - Female Grunt'; break;
    case 17: type = 'Fighting - Male Grunt'; break;
    case 18: type = 'Fire - Female Grunt'; break;
    case 19: type = 'Fire - Male Grunt'; break;
    case 20: type = 'Flying - Female Grunt'; break;
    case 21: type = 'Flying - Male Grunt'; break;
    case 22: type = 'Grass - Female Grunt'; break;
    case 23: type = 'Grass - Male Grunt'; break;
    case 24: type = 'Ground - Female Grunt'; break;
    case 25: type = 'Ground - Male Grunt'; break;
    case 26: type = 'Ice - Female Grunt'; break;
    case 27: type = 'Ice - Male Grunt'; break;
    case 28: type = 'Metal - Female Grunt'; break;
    case 29: type = 'Metal - Male Grunt'; break;
    case 30: type = 'Normal - Female Grunt'; break;
    case 31: type = 'Normal - Male Grunt'; break;
    case 32: type = 'Poison - Female Grunt'; break;
    case 33: type = 'Poison - Male Grunt'; break;
    case 34: type = 'Psychic - Female Grunt'; break;
    case 35: type = 'Psychic - Male Grunt'; break;
    case 36: type = 'Rock - Female Grunt'; break;
    case 37: type = 'Rock - Male Grunt'; break;
    case 38: type = 'Water - Female Grunt'; break;
    case 39: type = 'Water - Male Grunt'; break;
    case 40: type = 'Player Team Leader'; break;
    default: type = 'Not Invaded'
  }

  // CHECK EACH FEED FILTER
  MAIN.Invasion_Channels.forEach((invasion_channel, index) => {

    // DEFINE MORE VARIABLES
    let geofences = invasion_channel[1].geofences.split(',');
    let channel = MAIN.channels.get(invasion_channel[0]);
    let filter = MAIN.Filters.get(invasion_channel[1].filter);
    let role_id = '', embed = 'invasion.js';

    if (invasion_channel[1].roleid) {
      if (invasion_channel[1].roleid == 'here' || invasion_channel[1].roleid == 'everyone') {
        role_id = '@' + invasion_channel[1].roleid;
      } else {
        role_id = '<@&' + invasion_channel[1].roleid + '>';
      }
    }

    if (invasion_channel[1].embed) { embed = invasion_channel[1].embed; }


    // THROW ERRORS AND BREAK FOR INVALID DATA
    if (!filter) { console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] The filter defined for' + invasion_channel[0] + ' does not appear to exist.'); }
    else if (!channel) { console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] The channel ' + invasion_channel[0] + ' does not appear to exist.'); }

    // FILTER FOR INVASION TYPE
    else if (type) {

      // AREA FILTER
      if (geofences.indexOf(server.name) >= 0 || geofences.indexOf(main_area) >= 0 || geofences.indexOf(sub_area) >= 0) {

        if(filter.Invasion_Type.indexOf(type) >= 0){
        if (MAIN.debug.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Invasion Passed Filters for ' + invasion_channel[0] + '.'); }
        Send_Invasion.run(MAIN, channel, invasion, type, main_area, sub_area, embed_area, server, timezone, role_id, embed);
        }
      }
      else {
        if (MAIN.debug.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Invasion Did Not Pass Channel Geofences for ' + invasion_channel[0] + '. Expected: ' + invasion_channel[1].geofences + ' Saw: ' + server.name + '|' + main_area + '|' + sub_area); }
      }
    }
    else {
      if (MAIN.DEBUG.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Invasion Did Not Meet Type or Level Filter for ' + invasion_channel[0] + '. Expected: ' + filter.Invasion_Type + ', Saw: ' + type.toLowerCase()); }
    }
  });

}
