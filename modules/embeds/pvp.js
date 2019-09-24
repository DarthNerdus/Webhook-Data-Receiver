const Discord = require('discord.js');

module.exports.run = async (MAIN, target, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, role_id, embed, possible_cps, filter) => {
  let Embed_Config = require('../../embeds/'+embed);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);
  if (!member && target.user) {
	member = MAIN.guilds.get(server.id).members.get(target.user.id);
        member.bot = 0;
  }
  let pokemon = {type: '', color: '', form: '', gender: '', weather_boost: ''};

  // DETERMINE POKEMON NAME AND FORM
  pokemon.name = MAIN.masterfile.pokemon[sighting.pokemon_id].name;
  if (sighting.form > 0){
    if (MAIN.masterfile.pokemon[sighting.pokemon_id].forms[sighting.form] ) {
       form_name = '['+MAIN.masterfile.pokemon[sighting.pokemon_id].forms[sighting.form].name+'] ';
    }
  }

  pokemon.area = embed_area;
  pokemon.lat = sighting.latitude;
  pokemon.lon = sighting.longitude;

  // GET STATIC MAP TILE
  if(MAIN.config.Map_Tiles == 'ENABLED'){
    pokemon.map_img = await MAIN.Static_Map_Tile(sighting.latitude, sighting.longitude, 'pokemon');
  }

  // DESPAWN VERIFICATION
  console.log("pvp verified: "+sighting.verified);
  if(!sighting.verified) {
        if(MAIN.config.DEBUG.Pokemon_Timers == 'ENABLED'){console.log('DESPAWN for '+pokemon.name+' is not verified');}
        return;
  } 
  pokemon.verified = MAIN.emotes.checkYes;

  // DEFINE VARIABLES
  pokemon.time = await MAIN.Bot_Time(sighting.disappear_time, '1', timezone);
  pokemon.mins = Math.floor((sighting.disappear_time-(time_now/1000))/60);
  pokemon.secs = Math.floor((sighting.disappear_time-(time_now/1000)) - (pokemon.mins*60));

  // DETERMINE POKEMON NAME, FORM AND TYPE EMOTES
  pokemon.name = MAIN.masterfile.pokemon[sighting.pokemon_id].name;
  if (sighting.form > 0 && !MAIN.masterfile.pokemon[sighting.pokemon_id].types){
    pokemon.form = '['+MAIN.masterfile.pokemon[sighting.pokemon_id].forms[sighting.form].name+'] ';
    MAIN.masterfile.pokemon[sighting.pokemon_id].forms[sighting.form].types.forEach((type) => {
      pokemon.type += MAIN.emotes[type.toLowerCase()]+' '+type+' / ';
      pokemon.color = MAIN.Get_Color(type, pokemon.color);
    }); pokemon.type = pokemon.type.slice(0,-3);
  } else {
    MAIN.masterfile.pokemon[sighting.pokemon_id].types.forEach((type) => {
      pokemon.type += MAIN.emotes[type.toLowerCase()]+' '+type+' / ';
      pokemon.color = MAIN.Get_Color(type, pokemon.color);
    }); pokemon.type = pokemon.type.slice(0,-3);
  }

  // GET SPRITE IMAGE
  pokemon.sprite = await MAIN.Get_Sprite(sighting.form, sighting.pokemon_id);
  pokemon.map_url = MAIN.config.FRONTEND_URL;

  // GET GENDER
  switch(sighting.gender){
    case 1: pokemon.gender = ' ♂️'; break;
    case 2: pokemon.gender = ' ♀️'; break;
    default: pokemon.gender = '';
  }
  // Round IV
  pokemon.iv = Math.round(internal_value);

  // GET WEATHER BOOST
  switch(sighting.weather){
    case 1: pokemon.weather_boost = ' | '+MAIN.emotes.clear+' ***Boosted***'; break;
    case 2: pokemon.weather_boost = ' | '+MAIN.emotes.rain+' ***Boosted***'; break;
    case 3: pokemon.weather_boost = ' | '+MAIN.emotes.partlyCloudy+' ***Boosted***'; break;
    case 4: pokemon.weather_boost = ' | '+MAIN.emotes.cloudy+' ***Boosted***'; break;
    case 5: pokemon.weather_boost = ' | '+MAIN.emotes.windy+' ***Boosted***'; break;
    case 6: pokemon.weather_boost = ' | '+MAIN.emotes.snow+' ***Boosted***'; break;
    case 7: pokemon.weather_boost = ' | '+MAIN.emotes.fog+' ***Boosted***'; break;
  }


    if(sighting.cp == null){ return; }
    // DETERMINE MOVE NAMES AND TYPES
    pokemon.move_name_1 = MAIN.masterfile.moves[sighting.move_1].name;
    pokemon.move_type_1 = MAIN.emotes[MAIN.masterfile.moves[sighting.move_1].type.toLowerCase()];
    pokemon.move_name_2 = MAIN.masterfile.moves[sighting.move_2].name;
    pokemon.move_type_2 = MAIN.emotes[MAIN.masterfile.moves[sighting.move_2].type.toLowerCase()];

    // DETERMINE HEIGHT, WEIGHT AND SIZE
    pokemon.height = Math.floor(sighting.height*100)/100;
    pokemon.weight = Math.floor(sighting.weight*100)/100;
    pokemon.size = MAIN.Get_Size(sighting.pokemon_id, sighting.form, sighting.height, sighting.weight);

    pokemon.attack = sighting.individual_attack;
    pokemon.defense = sighting.individual_defense;
    pokemon.stamina = sighting.individual_stamina;
    pokemon.level = sighting.pokemon_level;
    pokemon.cp = sighting.cp;
    pokemon.encounter_id = sighting.encounter_id;
    pokemon.possible_cps = possible_cps;

    // RE-VERIFY TIMERS FOR NEGATIVE AND UNVERIFIED FOR IV SCAN
    if (pokemon.verified == MAIN.emotes.yellowQuestion || pokemon.mins < 1 ) {
      if(MAIN.config.DEBUG.Pokemon_Timers == 'ENABLED'){console.log('DESPAWN for '+pokemon.name+' is possibly inaccurate '+sighting.encounter_id);}
      MAIN.rdmdb.query(' SELECT * FROM pokemon WHERE spawnpoint_id = ? ORDER BY last_modified desc limit 1', [sighting.spawnpoint_id], function (error, record, fields) {
        if(error){ console.error(error); }
        if (record[0].disappear_time) {
          if(MAIN.config.DEBUG.Pokemon_Timers == 'ENABLED'){console.log('DESPAWN for '+pokemon.name+' is re-verified');}
          pokemon.time = MAIN.Bot_Time(record[0].expire_timestamp, '1', timezone);
          pokemon.mins = Math.floor((record[0].expire_timestamp-(time_now/1000))/60);
          pokemon.secs = Math.floor((record[0].expire_timestamp-(time_now/1000)) - (pokemon.mins*60));
          pokemon.verified = MAIN.emotes.checkYes;
        } else {
          if(MAIN.config.DEBUG.Pokemon_Timers == 'ENABLED'){console.log('DESPAWN for '+pokemon.name+' is not verified');}
        }
        pokemon_embed = Embed_Config(pokemon);
        send_embed(pokemon.mins);
      });
    } else {
      pokemon_embed = Embed_Config(pokemon);
      send_embed(pokemon.mins);
    }

    function send_embed(minutes) {
	var target_id = '';
	if (member) {
		target_id = member.id;
	} else {
		target_id = target.id;
	}
	MAIN.pdb.query(' SELECT * FROM sightings WHERE sighting_id = ? and disappear_time = ?', [sighting.spawnpoint_id, sighting.disappear_time], function (error, record, fields) {
	if (error) {
		console.error(error); return;
	} else {
		if (member) {
			MAIN.pdb.query("INSERT INTO sightings (sighting_id, pokemon_id, passed_filters, members, disappear_time) values (?,?,?,?,?) ON DUPLICATE KEY UPDATE members = CONCAT(members,',',?)", [sighting.spawnpoint_id, sighting.pokemon_id, '', target_id, sighting.disappear_time, target_id], function (error, record, fields) {
				if (error) { console.error(error); return; }
			});
		} else {
			MAIN.pdb.query("INSERT INTO sightings (sighting_id, pokemon_id, passed_filters, members, disappear_time) values (?,?,?,?,?) ON DUPLICATE KEY UPDATE passed_filters = CONCAT(passed_filters,',',?)", [sighting.spawnpoint_id, sighting.pokemon_id, target_id, '', sighting.disappear_time, target_id], function (error, record, fields) {
				if (error) { console.error(error); return; }
			});
		}
	}

	if (!record[0]) {
		send_discord_embed(minutes);
	} else if (member && !record[0].members.includes(target_id)) {
		send_discord_embed(minutes);
	} else if (!member && !record[0].passed_filters.includes(target_id)) {
		send_discord_embed(minutes);
	}
		
	});			
    }

    function send_discord_embed(minutes){
    if(member){
      if(MAIN.config.DEBUG.Pokemon == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [pokemon.js] Sent a '+pokemon.name+' to '+member.user.tag+' ('+member.id+').'); }
      return MAIN.Send_DM(server.id, member.id, pokemon_embed, target.bot);
    } else if(MAIN.config.POKEMON.Discord_Feeds == 'ENABLED'){
      if (minutes < MAIN.config.TIME_REMAIN) { return console.error('Timer ('+minutes+') for is less than '+MAIN.config.TIME_REMAIN+' '+pokemon.name+' ->'+sighting.encounter_id); }
      if(MAIN.config.DEBUG.Pokemon == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Embed] [pokemon.js] Sent a '+pokemon.name+' to '+target.guild.name+' ('+target.id+').'); }
      return MAIN.Send_Embed('pokemon', 0, server, role_id, pokemon_embed, target.id);
    } else{ return; }}

}
