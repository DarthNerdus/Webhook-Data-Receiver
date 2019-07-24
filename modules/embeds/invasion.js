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
    case 'Normal':
      pokestop.color = 'ec78ea';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey.png';
    break;
    case 'Glacial':
      pokestop.color = '5feafd';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_glacial.png';
    break;
    case 'Mossy':
      pokestop.color = '72ea38';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png/TroyKey_moss.png';
    break;
    case 'Magnetic':
      pokestop.color = 'fac036';
      pokestop.sprite = 'https://raw.githubusercontent.com/ZeChrales/PogoAssets/00dd14bec9d3e17f89ddb021d71853c8b4667cf0/static_assets/png/TroyKey_magnetic.png'
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
