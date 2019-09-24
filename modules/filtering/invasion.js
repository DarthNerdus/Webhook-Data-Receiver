delete require.cache[require.resolve('../embeds/invasion.js')];
const Send_Invasion = require('../embeds/invasion.js');
const Discord = require('discord.js');

module.exports.run = async (MAIN, invasion, main_area, sub_area, embed_area, server, timezone, role_id) => {

  if (MAIN.debug.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Received a Pokestop.'); }

  // FILTER FEED TYPE FOR EGG, BOSS, OR BOTH
  if(!invasion.incident_grunt_type) {
	if (MAIN.debug.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Pokestop is not invaded.'); }
	return;
  }
  let type = MAIN.grunttypes[invasion.incident_grunt_type].type, stop_id = invasion.pokestop_id;
  let first_reward = [];
  let second_reward = [];
  let grunt = MAIN.grunttypes[invasion.incident_grunt_type].grunt;

  if (MAIN.grunttypes[invasion.incident_grunt_type].encounters != null) {
    first_reward = MAIN.grunttypes[invasion.incident_grunt_type].encounters.first
    if (MAIN.grunttypes[invasion.incident_grunt_type].second_reward == 'true') {
      second_reward = MAIN.grunttypes[invasion.incident_grunt_type].encounters.second
    }
  }

  let encounters = first_reward.concat(second_reward);

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
    else if (type || grunt) {

      // AREA FILTER
      if (geofences.indexOf(server.name) >= 0 || geofences.indexOf(main_area) >= 0 || geofences.indexOf(sub_area) >= 0) {
        if (filter.type.indexOf(type.toLowerCase()) > -1) {
          if (MAIN.debug.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Invasion Passed Filters for ' + invasion_channel[0] + '.'); }
          Send_Invasion.run(MAIN, channel, invasion, first_reward, second_reward, grunt, type, main_area, sub_area, embed_area, server, timezone, role_id, embed);
        }
      }
      else {
        if (MAIN.debug.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Invasion Did Not Pass Channel Geofences for ' + invasion_channel[0] + '. Expected: ' + invasion_channel[1].geofences + ' Saw: ' + server.name + '|' + main_area + '|' + sub_area); }
      }
    }
    else {
      if (MAIN.DEBUG.Invasion == 'ENABLED') { console.info('[DEBUG] [Modules] [invasion.js] Invasion Did Not Meet Type or Level Filter for ' + invasion_channel[0] + '. Expected: ' + filter.type + ', Saw: ' + type.toLowerCase()); }
    }
  });

}
