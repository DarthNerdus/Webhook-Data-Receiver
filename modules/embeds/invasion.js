const Discord = require('discord.js');

module.exports.run = async (MAIN, target, invasion, first_reward, second_reward, grunt, type, main_area, sub_area, embed_area, server, timezone, role_id, embed) => {
  let Embed_Config = require('../../embeds/'+embed);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);
  let pokestop = {form: '', type: type, weaknesses: '', sprite: '', color: MAIN.Get_Color(type), map_img: '', rewards: []};
  let rewards = [];
  pokestop.area = embed_area;
  pokestop.lat = invasion.latitude;
  pokestop.lon = invasion.longitude;
  pokestop.pokemon_id = '';
  pokestop.first_reward = [];
  pokestop.second_reward = [];

  // GET STATIC MAP TILE
  if(MAIN.config.Map_Tiles == 'ENABLED'){
    pokestop.map_img = await MAIN.Static_Map_Tile(invasion.latitude, invasion.longitude, 'quest');
  }

  // DETERMINE STOP NAME
  pokestop.name = invasion.name;
  pokestop.url = invasion.url;

  // DEFINE VARIABLES
  let time_now = new Date().getTime();
  pokestop.time = await MAIN.Bot_Time(invasion.incident_expiration, '1', timezone);
  pokestop.mins = Math.floor((invasion.incident_expiration-(time_now/1000))/60);
  pokestop.secs = Math.floor((invasion.incident_expiration-(time_now/1000)) - (pokestop.mins*60));
  pokestop.map_url = MAIN.config.FRONTEND_URL;

  let emotes = MAIN.emotes;
  // GET pokestop TYPE, COLOR, AND SPRITE
  if (first_reward.length > 0) {
    if (second_reward.length == 0 && first_reward.length == 1) {
        pokestop.sprite = MAIN.Get_Sprite('00', parseInt(first_reward));
        //pokestop.rewards.push(pokestop.sprite);
        pokestop.rewards.push(MAIN.emojis.find(e => e.name.toLowerCase() == MAIN.masterfile.pokemon[parseInt(first_reward)].name.toLowerCase()))
        pokestop.first_reward.push(MAIN.emojis.find(e => e.name.toLowerCase() == MAIN.masterfile.pokemon[parseInt(first_reward)].name.toLowerCase()))
    } else {
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/Badge_Type_'+type+'_01.png';
      first_reward.forEach((reward, i) => {
        pokestop.rewards.push(MAIN.emojis.find(e => e.name.toLowerCase() == MAIN.masterfile.pokemon[parseInt(reward)].name.toLowerCase()))
        pokestop.first_reward.push(MAIN.emojis.find(e => e.name.toLowerCase() == MAIN.masterfile.pokemon[parseInt(reward)].name.toLowerCase()))
        second_reward = second_reward.filter(id => id != reward)
      })
      second_reward.forEach((reward, i) => {
        pokestop.rewards.push(MAIN.emojis.find(e => e.name.toLowerCase() == MAIN.masterfile.pokemon[parseInt(reward)].name.toLowerCase()))
        pokestop.second_reward.push(MAIN.emojis.find(e => e.name.toLowerCase() == MAIN.masterfile.pokemon[parseInt(reward)].name.toLowerCase()))
      })
    }
  }
  invasion_embed = await Embed_Config(pokestop);
  send_embed(pokestop.mins);

  function send_embed(minutes) {
        var target_id = '';
        if (member) {
                target_id = member.id;
        } else {
                target_id = target.id;
        }       
        MAIN.pdb.query(' SELECT * FROM sightings WHERE sighting_id = ? and disappear_time = ?', [invasion.pokestop_id, invasion.incident_expiration], function (error, record, fields) {
        if (error) {
                console.error(error); return;
        } else {
                if (member) {
                        MAIN.pdb.query("INSERT INTO sightings (sighting_id, pokemon_id, passed_filters, members, disappear_time) values (?,?,?,?,?) ON DUPLICATE KEY UPDATE members = CONCAT(passed_filters,',',?)", [invasion.pokestop_id, invasion.incident_grunt_type, '', target_id, invasion.incident_expiration, target_id], function (error, record, fields) {
                                if (error) { console.error(error); return; }
                        });     
                } else {
                        MAIN.pdb.query("INSERT INTO sightings (sighting_id, pokemon_id, passed_filters, members, disappear_time) values (?,?,?,?,?) ON DUPLICATE KEY UPDATE passed_filters = CONCAT(passed_filters,',',?)", [invasion.pokestop_id, invasion.incident_grunt_type, target_id, '', invasion.incident_expiration, target_id], function (error, record, fields) {
                                if (error) { console.error(error); return; }
                        });     
                }       
        }       
        
        if (!record[0]) {
                send_discord_embed(minutes);
        } else if (member && !record[0].members.includes(target_id)) {
                send_discord_embed(minutes);
        } else if (!record[0].passed_filters.includes(target_id)) {
                send_discord_embed(minutes);
        }       
        
        });
    }   


  function send_discord_embed(minutes){
    if(member){
      if(MAIN.config.DEBUG.Invasion == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [invasion.js] Sent a '+pokestop.name+' to '+member.user.tag+' ('+member.id+').'); }
      return MAIN.Send_DM(server.id, member.id, invasion_embed, target.bot);
    } else if(MAIN.config.INVASION.Discord_Feeds == 'ENABLED'){
      if (minutes < MAIN.config.TIME_REMAIN) { return console.error('Timer ('+minutes+') is less than '+MAIN.config.TIME_REMAIN+' '+pokestop.name); }
      if(MAIN.config.DEBUG.Invasion == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [invasion.js] Sent a '+pokestop.name+' to '+target.guild.name+' ('+target.id+').'); }
      return MAIN.Send_Embed('invasion', 0, server, role_id, invasion_embed, target.id);
    } else{ return; }}

}


