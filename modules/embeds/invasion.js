const Discord = require('discord.js');

module.exports.run = async (MAIN, target, invasion, type, main_area, sub_area, embed_area, server, timezone, role_id, embed) => {
  let Embed_Config = require('../../embeds/'+embed);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);
  let pokestop = {type: type, color: '', map_img: ''};
  pokestop.area = embed_area;
  pokestop.lat = invasion.latitude;
  pokestop.lon = invasion.longitude;

  // GET STATIC MAP TILE
  if(MAIN.config.Map_Tiles == 'ENABLED'){
    pokestop.map_img = await MAIN.Static_Map_Tile(invasion.latitude, invasion.longitude, 'quest');
  }

  // DETERMINE STOP NAME
  pokestop.name = invasion.name;
  pokestop.url = invasion.url;

  // DEFINE VARIABLES
  let time_now = new Date().getTime();
  pokestop.time = await MAIN.Bot_Time(invasion.incident_expire_timestamp, '1', timezone);
  pokestop.mins = Math.floor((invasion.incident_expire_timestamp-(time_now/1000))/60);
  pokestop.secs = Math.floor((invasion.incident_expire_timestamp-(time_now/1000)) - (pokestop.mins*60));
  pokestop.map_url = MAIN.config.FRONTEND_URL;

  // GET INVASION TYPE, COLOR, AND SPRITE
  switch(type){
    case 'Normal - Female Grunt':
    case 'Normal - Male Grunt':
      pokestop.color = '808080';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/Badge_Type_Normal_01.png';
    break;
    case 'Dragon - Female Grunt':
    case 'Dragon - Male Grunt':
      pokestop.color = '3568b5';
      pokestop.sprite = 'https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/pokemon_icon_147_00.png';
    break;
    case 'Dark - Female Grunt':
    case 'Dark - Male Grunt':
      pokestop.color = '000000';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/Badge_Type_Dark_01.png';
    break;
    case 'Darkness - Female Grunt':
    case 'Darkness - Male Grunt':
      pokestop.color = '815bc2';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/Badge_Type_Ghost_01.png'
    break;
    case 'Psychic - Female Grunt':
    case 'Psychic - Male Grunt':
      pokestop.color = 'fa8f7c';
      pokestop.sprite = 'https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/pokemon_icon_280_00.png'
    break;
    default:
      pokestop.color = '188ae2';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/decrypted_assets/png/Badge_58_2_01.png';
    break;
  }
  invasion_embed = await Embed_Config(pokestop);
  send_embed(pokestop.mins);

  function send_embed(minutes){
  if(member){
    if(MAIN.config.DEBUG.Invasion == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [invasion.js] Sent a '+pokestop.name+' to '+member.user.tag+' ('+member.id+').'); }
    return MAIN.Send_DM(server.id, member.id, invasion_embed, target.bot);
  } else if(MAIN.config.INVASION.Discord_Feeds == 'ENABLED'){
    if (minutes < MAIN.config.TIME_REMAIN) { return console.error('Timer ('+minutes+') is less than '+MAIN.config.TIME_REMAIN+' '+pokestop.name); }
    if(MAIN.config.DEBUG.Invasion == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [invasion.js] Sent a '+pokestop.name+' to '+target.guild.name+' ('+target.id+').'); }
    return MAIN.Send_Embed('invasion', 0, server, role_id, invasion_embed, target.id);
  } else{ return; }}

}
