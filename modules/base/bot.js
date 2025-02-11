const InsideGeojson = require('point-in-geopolygon');
const unicodeEmojis = require('./unicodeemojis');
const moment = require('moment-timezone');
const StaticMaps = require('staticmaps');
const Discord = require('discord.js');
const Ontime = require('ontime');
const GeoTz = require('geo-tz');
const MySQL = require('mysql');
const ini = require('ini');
const fs = require('fs');


// EVENTS TO DISABLE TO SAVE MEMORY AND CPU
var eventsToDisable = ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'clientUserGuildSettingsUpdate',
  'clientUserSettingsUpdate', 'debug', 'disconnect', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'guildCreate', 'guildDelete',
  'guildMemberAvailable', 'guildMembersChunk', 'guildMemberSpeaking', 'guildMemberUpdate', 'guildUnavailable', 'guildUpdate',
  'messageDelete', 'messageDeleteBulk', 'messageReactionRemoveAll', 'messageUpdate', 'presenceUpdate', 'ready', 'reconnecting', 'resume',
  'roleCreate', 'roleDelete', 'roleUpdate', 'typingStart', 'typingStop', 'userNoteUpdate', 'userUpdate', 'voiceStateUpdate', 'warn'];

// DEFINE BOTS AND DISABLE ALL EVENTS TO SAVE MEMORY AND CPU
const MAIN = new Discord.Client({ disabledEvents: eventsToDisable });
const ALPHA = new Discord.Client({ disabledEvents: eventsToDisable });
const BRAVO = new Discord.Client({ disabledEvents: eventsToDisable });
const CHARLIE = new Discord.Client({ disabledEvents: eventsToDisable });
const DELTA = new Discord.Client({ disabledEvents: eventsToDisable });
const ECHO = new Discord.Client({ disabledEvents: eventsToDisable });
const FOXTROT = new Discord.Client({ disabledEvents: eventsToDisable });
const GULF = new Discord.Client({ disabledEvents: eventsToDisable });
const HOTEL = new Discord.Client({ disabledEvents: eventsToDisable });
const INDIA = new Discord.Client({ disabledEvents: eventsToDisable });
const JULIET = new Discord.Client({ disabledEvents: eventsToDisable });
const KILO = new Discord.Client({ disabledEvents: eventsToDisable });
const LIMA = new Discord.Client({ disabledEvents: eventsToDisable });
const MIKE = new Discord.Client({ disabledEvents: eventsToDisable });
const NOVEMBER = new Discord.Client({ disabledEvents: eventsToDisable });
const OSCAR = new Discord.Client({ disabledEvents: eventsToDisable });

// INITIAL LOAD OF CONFIG AND DISCORDS
MAIN.config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));
MAIN.Discord = require('../../config/discords.json');

// GLOBAL VARIABLES, LOGGING, & DEBUGGING
MAIN.BOTS = []; MAIN.debug = MAIN.config.DEBUG;
MAIN.logging = MAIN.config.CONSOLE_LOGS;

// RDM DATABASE CONNECTION
MAIN.rdmdb = MySQL.createConnection({
  host: MAIN.config.rdmDB.host,
  user: MAIN.config.rdmDB.username,
  password: MAIN.config.rdmDB.password,
  port: MAIN.config.rdmDB.port,
  database: MAIN.config.rdmDB.db_name
});

// POKEBOT DATABASE CONNECTION
MAIN.pdb = MySQL.createConnection({
  host: MAIN.config.DB.host,
  user: MAIN.config.DB.username,
  password: MAIN.config.DB.password,
  port: MAIN.config.DB.port,
  database: MAIN.config.DB.db_name
});

MAIN.pmsf = MySQL.createConnection({
  host: MAIN.config.pmsfDB.host,
  user: MAIN.config.pmsfDB.username,
  password: MAIN.config.pmsfDB.password,
  port: MAIN.config.pmsfDB.port,
  database: MAIN.config.pmsfDB.db_name
});

// LOAD CHANNELS
const raid_channels = ini.parse(fs.readFileSync('./config/channels_raids.ini', 'utf-8'));
const pokemon_channels = ini.parse(fs.readFileSync('./config/channels_pokemon.ini', 'utf-8'));
const quest_channels = ini.parse(fs.readFileSync('./config/channels_quests.ini', 'utf-8'));
const lure_channels = ini.parse(fs.readFileSync('./config/channels_lure.ini', 'utf-8'));
const invasion_channels = ini.parse(fs.readFileSync('./config/channels_invasion.ini', 'utf-8'));

// DEFINE AND LOAD MODULES
var Raid_Feed, Raid_Subscription, Emojis, Quest_Feed, Commands;
var Quest_Subscription, Pokemon_Feed, Pokemon_Subscription, Reactions;
function load_data() {
  delete require.cache[require.resolve('./reactions')];
  Reactions = require('./reactions');
  delete require.cache[require.resolve('../filtering/raids.js')];
  Raid_Feed = require('../filtering/raids.js');
  delete require.cache[require.resolve('../subscriptions/raids.js')];
  Raid_Subscription = require('../subscriptions/raids.js');
  delete require.cache[require.resolve('../filtering/quests.js')];
  Quest_Feed = require('../filtering/quests.js');
  delete require.cache[require.resolve('../subscriptions/quests.js')];
  Quest_Subscription = require('../subscriptions/quests.js');
  delete require.cache[require.resolve('../filtering/pokemon.js')];
  Pokemon_Feed = require('../filtering/pokemon.js');
  delete require.cache[require.resolve('../subscriptions/pokemon.js')];
  Pokemon_Subscription = require('../subscriptions/pokemon.js');
  delete require.cache[require.resolve('../filtering/lure.js')];
  Lure_Feed = require('../filtering/lure.js');
  //delete require.cache[require.resolve('../subscriptions/lure.js')];
  //Lure_Subscription = require('../subscriptions/lure.js');
  delete require.cache[require.resolve('../filtering/invasion.js')];
  Invasion_Feed = require('../filtering/invasion.js');
  delete require.cache[require.resolve('./emojis.js')];
  Emojis = require('./emojis.js');
  delete require.cache[require.resolve('../filtering/commands.js')];
  Commands = require('../filtering/commands.js');
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded 5 Modules.');

  // CACHE DATA FROM JSONS
  delete require.cache[require.resolve('../../static/en.json')];
  MAIN.proto = require('../../static/en.json');
  delete require.cache[require.resolve('../../static/database.json')];
  MAIN.db = require('../../static/database.json');
  delete require.cache[require.resolve('../../static/types.json')];
  MAIN.types = require('../../static/types.json');
  delete require.cache[require.resolve('../../static/masterfile.json')];
  MAIN.masterfile = require('../../static/masterfile.json');
  delete require.cache[require.resolve('../../static/cp_multiplier.json')];
  MAIN.cp_multiplier = require('../../static/cp_multiplier.json');
  delete require.cache[require.resolve('../../static/gyms.json')];
  MAIN.gym_notes = require('../../static/gyms.json');
  delete require.cache[require.resolve('../../static/rewards.json')];
  MAIN.rewards = require('../../static/rewards.json');
  delete require.cache[require.resolve('../../config/discords.json')];
  MAIN.Discord = require('../../config/discords.json');
  delete require.cache[require.resolve('../../static/grunttype.json')];
  MAIN.grunttypes = require('../../static/grunttype.json');
  MAIN.config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded all Configs and Static Files.');

  // LOAD RAID FEED CHANNELS
  MAIN.Raid_Channels = [];
  for (var key in raid_channels) { MAIN.Raid_Channels.push([key, raid_channels[key]]); }
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + MAIN.Raid_Channels.length + ' Raid Channels.');

  // LOAD POKEMON FEED CHANNELS
  MAIN.Pokemon_Channels = [];
  for (var key in pokemon_channels) { MAIN.Pokemon_Channels.push([key, pokemon_channels[key]]); }
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + MAIN.Pokemon_Channels.length + ' Pokémon Channels');

  // LOAD QUEST FEED CHANNELS
  MAIN.Quest_Channels = [];
  for (var key in quest_channels) { MAIN.Quest_Channels.push([key, quest_channels[key]]); }
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + MAIN.Quest_Channels.length + ' Quest Channels.');

  // LOAD LURE FEED CHANNELS
  MAIN.Lure_Channels = [];
  for (var key in lure_channels) { MAIN.Lure_Channels.push([key, lure_channels[key]]); }
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + MAIN.Lure_Channels.length + ' Lure Channels.');

  // LOAD INVASION FEED CHANNELS
  MAIN.Invasion_Channels = [];
  for (var key in invasion_channels) { MAIN.Invasion_Channels.push([key, invasion_channels[key]]); }
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + MAIN.Invasion_Channels.length + ' Invasion Channels.');

  // LOAD COMMANDS
  MAIN.Commands = new Discord.Collection();
  fs.readdir('./modules/commands', (err, files) => {
    let command_files = files.filter(f => f.split('.').pop() === 'js'), command_count = 0;
    command_files.forEach((f, i) => {
      delete require.cache[require.resolve('../commands/' + f)]; command_count++;
      let command = require('../commands/' + f); MAIN.Commands.set(f.slice(0, -3), command);
    }); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + command_count + ' Command Files.')
  });

  // LOAD FILTERS
  MAIN.Filters = new Discord.Collection();
  fs.readdir('./filters', (err, filters) => {
    let filter_files = filters.filter(f => f.split('.').pop() === 'json'), filter_count = 0;
    console.log(filter_files);
    filter_files.forEach((f, i) => {
      delete require.cache[require.resolve('../../filters/' + f)]; filter_count++;
      let filter = require('../../filters/' + f); filter.name = f; MAIN.Filters.set(f, filter);
    }); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + filter_count + ' Feed Filters.');
  });

  // LOAD GEOFENECS
  MAIN.Geofences = new Discord.Collection();
  fs.readdir('./geofences', (err, geofences) => {
    let geofence_files = geofences.filter(g => g.split('.').pop() === 'json'), geofence_count = 0;
    geofence_files.forEach((g, i) => {
      ;
      delete require.cache[require.resolve('../../geofences/' + g)]; geofence_count++;
      let geofence = require('../../geofences/' + g); geofence.name = g; MAIN.Geofences.set(g, geofence);
    }); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Loaded ' + geofence_count + ' Geofence files.');
  });



  // END FUNCTION
  return;
}

//CHECK FOR MESSAGE REACTION ADDS
MAIN.on('raw', event => {
  switch (true) {
    case !MAIN.Active: break;
    case MAIN.config.Raid_Lobbies == 'DISABLED': return;
    case event.t == null: return;
    case event.d.user_id == MAIN.user.id: return;
    case event.t == 'MESSAGE_REACTION_REMOVE':
    case event.t == 'MESSAGE_REACTION_ADD': return Reactions.run(MAIN, event);
    default: return;
  }
});

// CHOOSE NEXT BOT AND SEND EMBED
MAIN.Send_Embed = (type, raid_level, server, roleID, embed, channel_id) => {
  if (MAIN.Next_Bot == MAIN.BOTS.length - 1 && MAIN.BOTS[0]) { MAIN.Next_Bot = 0; } else { MAIN.Next_Bot++; }
  if (!MAIN.BOTS[MAIN.Next_Bot].channels.get(channel_id)) { console.log('Problem finding channel: ' + channel_id + ' using bot token: ' + MAIN.BOTS[MAIN.Next_Bot].token); }
  return MAIN.BOTS[MAIN.Next_Bot].channels.get(channel_id).send(roleID, embed)
    .then(message => {
      if (type == 'raid' && raid_level >= server.min_raid_lobbies && MAIN.config.Raid_Lobbies == 'ENABLED') {
        message.react(MAIN.emotes.plusOneReact.id).catch(console.error).then(reaction => {
          message.react(MAIN.emotes.plusTwoReact.id).catch(console.error).then(reaction => {
            message.react(MAIN.emotes.plusThreeReact.id).catch(console.error).then(reaction => {
              message.react(MAIN.emotes.plusFourReact.id).catch(console.error).then(reaction => {
                message.react(MAIN.emotes.cancelReact.id).catch(console.error)
              })
            })
          })
        })
      }
    })
    .catch(error => { console.error('[' + channel_id + '] [' + MAIN.BOTS[MAIN.Next_Bot].id + ']', error); MAIN.restart(); });
}

// CHOOSE NEXT BOT AND SEND EMBED
MAIN.Send_DM = (guild_id, user_id, embed, bot) => {
  MAIN.BOTS[bot].guilds.get(guild_id).fetchMember(user_id).then(TARGET => {
    return TARGET.send(embed).catch(error => {
      if (error) { console.error(TARGET.user.tag + ' (' + TARGET.id + ')', error); }
    });
  });
}

// ACCEPT AND SEND PAYLOADS TO ITS PARSE FUNCTION
MAIN.webhookParse = async (PAYLOAD) => {
  let discord_match = false;
  let proper_data = false;

  // IGNORE IF BOT HAS NOT BEEN FINISHED STARTUP
  if (!MAIN.Active) { return; }

  // SEPARATE EACH PAYLOAD AND SORT
  await PAYLOAD.forEach(async (data, index) => {

    // IGNORE IF NOT A SPECIFIED OBJECT
    if (data.type == 'pokemon' || data.type == 'raid' || data.type == 'quest' || data.type == 'pokestop' || data.type == 'invasion') {

      proper_data = true;

      MAIN.Discord.Servers.forEach(async (server, index) => {

        if (InsideGeojson.polygon(server.geofence, [data.message.longitude, data.message.latitude])) {

          // DEFINE AND DETERMINE TIMEZONE
          let timezone = GeoTz(server.geofence[0][1][1], server.geofence[0][1][0])[0]; discord_match = true;

          // DEFINE AREAS FROM GEOFENCE FILE
          let main_area = '', sub_area = '', embed_area = '';
          if (server.geojson_file) {
            let geofence = await MAIN.Geofences.get(server.geojson_file);
            await geofence.features.forEach((geo,index) => {
              if(InsideGeojson.feature({features:[geo]}, [data.message.longitude,data.message.latitude]) != -1){
                switch(geo.properties.sub_area){
                  case 'true': sub_area = geo.properties.name;
                    break;
                  default: main_area = geo.properties.name;
                }
              }
            });
          }

          // ASSIGN AREA TO VARIABLES
          if (sub_area) { embed_area = sub_area; }
          if (main_area && !sub_area) { embed_area = main_area; }
          if (!sub_area && !main_area) { embed_area = server.name; }
          // SEND TO OBJECT MODULES
          switch (data.type) {
            // SEND TO POKEMON MODULES
            case 'pokemon':
              Pokemon_Feed.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone);
              Pokemon_Subscription.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone); break;
            // SEND TO RAIDS MODULES
            case 'raid':
              Raid_Feed.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone);
              Raid_Subscription.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone); break;
            // SEND TO QUESTS MODULES
            case 'quest':
              Quest_Feed.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone);
              Quest_Subscription.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone); break;
            case 'pokestop':
              Lure_Feed.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone); break;
            //Lure_Subscription.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone); break;
            case 'invasion':
              Invasion_Feed.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone); break;
            //Invasion_Subscription.run(MAIN, data.message, main_area, sub_area, embed_area, server, timezone); break;
          }
        }
      }); return;
    }
  });
  // DEBUG
  if (discord_match == false && proper_data == true && MAIN.debug.PAYLOADS == 'ENABLED') {
    return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] None of the items contained in the RDM payload matched your discords.json geofences. This error is thrown for multiple reasons. You could be scanning an area outside of your discords.json geofences, your geofences within discords.json are in not in geojson format, or not big enough for your area.', PAYLOAD);
  } else { return; }
}

// SEND MESSAGES TO COMMAND MODULE
MAIN.on('message', message => { return Commands.run(MAIN, message); });
// ALPHA.on('message', message => { return Commands.run(MAIN, message); });
// BRAVO.on('message', message => { return Commands.run(MAIN, message); });
// CHARLIE.on('message', message => { return Commands.run(MAIN, message); });
// DELTA.on('message', message => { return Commands.run(MAIN, message); });
// ECHO.on('message', message => { return Commands.run(MAIN, message); });
// FOXTROT.on('message', message => { return Commands.run(MAIN, message); });
// GULF.on('message', message => { return Commands.run(MAIN, message); });
// HOTEL.on('message', message => { return Commands.run(MAIN, message); });
// INDIA.on('message', message => { return Commands.run(MAIN, message); });
// JULIET.on('message', message => { return Commands.run(MAIN, message); });
// KILO.on('message', message => { return Commands.run(MAIN, message); });
// LIMA.on('message', message => { return Commands.run(MAIN, message); });
// MIKE.on('message', message => { return Commands.run(MAIN, message); });
// NOVEMBER.on('message', message => { return Commands.run(MAIN, message); });
// OSCAR.on('message', message => { return Commands.run(MAIN, message); });

// SAVE A USER IN THE USER TABLE
MAIN.Save_Sub = (message, server) => {
  MAIN.pdb.query('SELECT * FROM info', function (error, info, fields) {
    let next_bot = info[0].user_next_bot, split = MAIN.config.QUEST.Default_Delivery.split(':');
    if (next_bot == MAIN.BOTS.length - 1) { next_bot = 0; } else { next_bot++; }
    let quest_time = moment(), timezone = GeoTz(server.geofence[0][0][1], server.geofence[0][0][0]);
    quest_time = moment.tz(quest_time, timezone[0]).set({ hour: split[0], minute: split[1], second: 0, millisecond: 0 });
    quest_time = moment.tz(quest_time, MAIN.config.TIMEZONE).format('HH:mm');
    user_name = message.member.user.tag.replace(/[\W]+/g, '');
    MAIN.pdb.query('INSERT INTO users (user_id, user_name, geofence, pokemon, quests, raids, status, bot, alert_time, discord_id, pokemon_status, raids_status, quests_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_name = ?',
      [message.member.id, user_name, server.name, , , , 'ACTIVE', next_bot, quest_time, message.guild.id, 'ACTIVE', 'ACTIVE', 'ACTIVE', user_name], function (error, user, fields) {
        if (error) { return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO ADD USER TO users TABLE', error); }
        else {
          MAIN.sqlFunction('UPDATE info SET user_next_bot = ?', [next_bot], undefined, undefined);
          return console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] Added ' + message.member.user.tag + ' to the user table.');
        }
      });
  }); return;
}

// RETURN TIME FUNCTION
MAIN.Bot_Time = (time, type, timezone) => {
  switch (type) {
    case '1': return moment.unix(time).tz(timezone).format('h:mm A');
    case '2': return moment().tz(timezone).format('HHmm');
    case '3': return moment(time).tz(timezone).format('HHmm');
    case 'quest': return moment().tz(timezone).format('dddd, MMMM Do') + ' @ Midnight';
    case 'stamp': return moment().format('HH:mmA');
    case 'nest': return moment.unix(time).tz(timezone).format('MMM Do YYYY hA')
  }
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

// OBTAIN POKEMON SPRITE
MAIN.Get_Sprite = (form, id) => {
  let sprite_url = MAIN.config.SPRITE_URL;
  let extension = '.png';
  // SHUFFLE ICONS
  if (MAIN.config.SPRITE_TYPE == 'SHUFFLE') {
    if (form > 0) {
      extension = '_' + form + extension;
    } else { extension = '_00' + extension; }
    sprite_url = sprite_url + 'pokemon_icon_';
  }
  // ASSET ICONS
  if (MAIN.config.SPRITE_TYPE == 'ASSETS') {
    if (form > 0) {
      switch (MAIN.masterfile.pokemon[id].forms[form].name) {
        case 'Alolan': extension = '_61' + extension; break;
        case 'Origin': extension = '_12' + extension; break;
        case 'Sunny': extension = '_12' + extension; break;
        case 'Rainy': extension = '_13' + extension; break;
        case 'Snowy': extension = '_14' + extension; break;
        case 'Normal': extension = '_00' + extension; break;
        default: extension = extension;
      }
    } else { extension = '_00' + extension; }
    sprite_url = sprite_url + 'pokemon_icon_';
  }
  // SEREBII ICONS
  if ((form > 0) && (MAIN.config.SPRITE_TYPE == 'DEFAULT')) {
    if (!MAIN.masterfile.pokemon[id].forms[form]) { console.log('Error finding pokemon with form ' + id + ' ' + form); }
    switch (MAIN.masterfile.pokemon[id].forms[form].name) {
      case 'Alolan': extension = '-a' + extension; break;
      case 'Origin': extension = '-o' + extension; break;
      case 'Sandy': extension = '-c' + extension; break;
      case 'Trash': extension = '-s' + extension; break;
      default: extension = extension;
    }
  }
  sprite_url = sprite_url + pad(id, 3) + extension;
  //console.log(sprite_url);
  return sprite_url;
}

MAIN.Get_Color = (type, color) => {
  if (!color) {
    switch (type.toLowerCase()) {
      case 'fairy': color = 'e898e8'; break;
      case 'ghost': color = '705898'; break;
      case 'grass': color = '78c850'; break;
      case 'water': color = '6890f0'; break;
      case 'bug': color = 'a8b820'; break;
      case 'fighting': color = 'c03028'; break;
      case 'electric': color = 'f8d030'; break;
      case 'rock': color = 'b8a038'; break;
      case 'fire': color = 'f08030'; break;
      case 'flying': color = 'a890f0'; break;
      case 'ice': color = '98d8d8'; break;
      case 'ground': color = 'e0c068'; break;
      case 'steel': color = 'b8b8d0'; break;
      case 'dragon': color = '7038f8'; break;
      case 'poison': color = 'a040a0'; break;
      case 'psychic': color = 'f85888'; break;
      case 'dark': color = '705848'; break;
      case 'normal': color = '8a8a59'; break;
    }
  }
  return color;
}

MAIN.Get_Area = (MAIN, lat, lon, discord) => {
  return new Promise(async function (resolve, reject) {
    if (InsideGeojson.polygon(discord.geofence, [lon, lat])) {

      // DEFINE AND DETERMINE TIMEZONE
      let timezone = GeoTz(discord.geofence[0][1][1], discord.geofence[0][1][0])[0]; discord_match = true;

      // DEFINE AREAS FROM GEOFENCE FILE
      let main_area = '', sub_area = '', embed_area = '';
      if (discord.geojson_file) {
        let geofence = await MAIN.Geofences.get(discord.geojson_file);
        await geofence.features.forEach((geo,index) => {
          if(InsideGeojson.feature({features:[geo]}, [lon,lat]) != -1){
            switch(geo.properties.sub_area){
              case 'true': sub_area = geo.properties.name;
                break;
              default: main_area = geo.properties.name;
            }
          }
        });
      }
      // ASSIGN AREA TO VARIABLES
      if (sub_area) { embed_area = sub_area; }
      if (main_area && !sub_area) { embed_area = main_area; }
      if (!sub_area && !main_area) { embed_area = discord.name; }

      let area = { main_area: main_area, embed_area: embed_area }

      return resolve(area);


    }
    not = 'Searched loaction not in your discords.json or geofence file';
    return reject(not);
  });
}

// GET QUEST REWARD ICON
MAIN.Get_Icon = (object, quest_reward) => {
  let questUrl = '';
  MAIN.rewards.array.forEach((reward, index) => {
    if (quest_reward.indexOf(reward.name) >= 0) { questUrl = reward.url; }
  }); return questUrl;
}

// Get Size of Pokemon BIG Karp/Tiny Rat
MAIN.Get_Size = (pokemon_id, form_id, pokemon_height, pokemon_weight) => {
        let weightRatio = 0, heightRatio = 0;
        if (form_id > 0 && !MAIN.masterfile.pokemon[pokemon_id].weight){
          weightRatio = pokemon_weight / MAIN.masterfile.pokemon[pokemon_id].forms[form_id].weight;
          heightRatio = pokemon_height / MAIN.masterfile.pokemon[pokemon_id].forms[form_id].height;
        } else {
          weightRatio = pokemon_weight / MAIN.masterfile.pokemon[pokemon_id].weight;
          heightRatio = pokemon_height / MAIN.masterfile.pokemon[pokemon_id].height;
        }

  let size = heightRatio + weightRatio;

  if (size < 1.5) {
    return 'tiny';
  } else
    if (size <= 1.75) {
      return 'small';
    } else
      if (size < 2.25) {
        return 'normal';
      } else
        if (size <= 2.5) {
          return 'large';
        } else
          return 'big';
}

// CHECK FOR OR CREATE MAP TILES FOR EMBEDS
MAIN.Static_Map_Tile = (lat, lon, type) => {
  return new Promise(function (resolve, reject) {
    let path = MAIN.config.IMAGE_DIR + type + '_tiles/' + lat + ',' + lon + '.png';
    let url = MAIN.config.HOST + type + '_tiles/' + lat + ',' + lon + '.png';
    if (MAIN.config.DEBUG.Map_Tiles == 'ENABLED') {
      console.info('[DEBUG] [Map Tiles] ' + path);
      console.info('[DEBUG] [Map Tiles] ' + url);
    }
    if(fs.existsSync(path)){ return resolve(url); }
    else{
      let options = { width: parseInt(MAIN.config.Tile_Width), height: parseInt(MAIN.config.Tile_Height) };
      if(MAIN.config.Tile_Server){ options.tileUrl = MAIN.config.Tile_Server; }
      let zoom = 16, center = [lon,lat], map = new StaticMaps(options);
      let marker = { img: `https://i.imgur.com/OGMRWnh.png`, width: 40, height: 40 };
      if(MAIN.config.Tile_Marker){ marker.img = MAIN.config.Tile_Marker; }
      marker.coord = [lon,lat]; map.addMarker(marker);
      map.render(center, zoom)
        .then(() => { map.image.save(MAIN.config.IMAGE_DIR + type + '_tiles/' + lat + ',' + lon + '.png'); })
        .then(() => { console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Map Tiles] Saved a new map tile to ' + type + '_images.'); return resolve(url); })
        .catch(function (err) { console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO SAVE MAP TILE.'); return resolve(undefined); });
    }
  });
}

// SQL QUERY FUNCTION
MAIN.sqlFunction = (sql, data, logSuccess, logError) => {
  return new Promise(resolve => {
    MAIN.pdb.query(sql, data, function (error, result, fields) {
      if (error) { console.error(logError, error); }
      if (logSuccess) { console.info(logSuccess); }
      return resolve(result);
    }); return;
  });
}

// CREAT GYM AND POKEMON NAME ARRAY
setTimeout(function () { load_arrays(); }, 21600000);

function load_arrays() {
  MAIN.gym_array = []; MAIN.pokemon_array = []; MAIN.park_array = [];
  MAIN.pokemon_array = Object.keys(MAIN.masterfile.pokemon).map(i => MAIN.masterfile.pokemon[i].name);
  // Gym Names Array
  MAIN.rdmdb.query(`SELECT * FROM gym WHERE name is not NULL ORDER BY name`, function (error, gyms, fields) {
    if (gyms) {
      gyms.forEach((gym, index) => {
        let record = {};
        record.name = gym.name; record.id = gym.id;
        record.lat = gym.lat; record.lon = gym.lon;
        record.ex_raid_eligible = gym.ex_raid_eligible;
        MAIN.gym_array.push(record);
      }); return;
    } else { return; }
  });
  // Nest Names Array
  MAIN.pmsf.query(`SELECT * FROM nests WHERE name != 'Unknown Areaname'`, function (error, parks, fields) {
    if (parks) {
      parks.forEach((park, index) => {
        let record = {};
        record.name = park.name; record.id = park.nest_id;
        record.lat = park.lat; record.lon = park.lon;
        MAIN.park_array.push(record);
      }); return;
    } else { return; }
  });
}

// PERFORM AN UPDATE FOR EACH VERSION UP TO LATEST
async function update_each_version(version) {
  return new Promise(async (resolve) => {
    for (let u = version; u <= MAIN.db.LATEST; u++) {
      if (u == MAIN.db.LATEST) { return resolve('DONE'); }
      else {
        let update_to = u + 1;
        await MAIN.db[update_to].forEach(async (update, index) => {
          await MAIN.sqlFunction(update.sql, update.data, '[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] ' + update.gLog, update.bLog);
          await MAIN.sqlFunction('UPDATE info SET db_version = ? WHERE db_version = ?', [update_to, u], undefined, '[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO UPDATE THE info TABLE.');
          console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] Database updated to Version ' + update_to + '.');
        });
      }
    } return resolve('done');
  });
}

// CREATE DATABASE, TABLES, AND CHECK FOR UPDATES
async function update_database() {
  return new Promise(async function (resolve, reject) {
    await MAIN.sqlFunction('CREATE TABLE IF NOT EXISTS users (user_id TEXT, user_name TEXT, geofence TEXT, pokemon TEXT, quests TEXT, raids TEXT, paused TEXT, bot TEXT, alert_time TEXT, city TEXT)', undefined, undefined, '[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO CREATE THE user TABLE.');
    await MAIN.sqlFunction('CREATE TABLE IF NOT EXISTS quest_alerts (user_id TEXT, quest TEXT, embed TEXT, area TEXT, bot TEXT, alert_time bigint, city text)', undefined, undefined, '[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO CREATE THE quest_alerts TABLE.');
    await MAIN.sqlFunction('CREATE TABLE IF NOT EXISTS info (db_version INT)', undefined, undefined, '[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO CREATE THE info TABLE.');
    await MAIN.pdb.query('SELECT * FROM info', async function (error, row, fields) {
      if (!row || !row[0]) {
        await MAIN.sqlFunction('INSERT INTO info (db_version) VALUES (?)', [1], undefined, '[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO INSERT INTO THE info TABLE.')
          .then(async (db) => {
            let version = await update_each_version(1);
            return resolve(version);
          });
      } else if (row[0].db_version < MAIN.db.LATEST) {
        await console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] Database Update Found. Updating...');
        let version = await update_each_version(row[0].db_version);
        return resolve(version);
      } else { return resolve(false); }
    }); return;
  });
}

// SET ALL TO INVISIBLE ON READY
MAIN.on('ready', () => {
  return console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Main (' + MAIN.user.tag + ') is logged in.');
});
ALPHA.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Alpha (' + ALPHA.user.tag + ') is logged in.');

  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return ALPHA.user.setPresence({ status: 'invisible' });
  }
  else return;
});
BRAVO.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Bravo (' + BRAVO.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return BRAVO.user.setPresence({ status: 'invisible' });
  }
  else return;
});
CHARLIE.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Charlie (' + CHARLIE.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return CHARLIE.user.setPresence({ status: 'invisible' });
  }
  else return;
});
DELTA.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Delta (' + DELTA.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return DELTA.user.setPresence({ status: 'invisible' });
  }
  else return;
});
ECHO.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Echo (' + ECHO.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return ECHO.user.setPresence({ status: 'invisible' });
  }
  else return;
});
FOXTROT.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Foxtrot (' + FOXTROT.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return FOXTROT.user.setPresence({ status: 'invisible' });
  }
  else return;
});
GULF.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Gulf (' + GULF.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return GULF.user.setPresence({ status: 'invisible' });
  }
  else return;
});
HOTEL.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Hotel (' + HOTEL.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return HOTEL.user.setPresence({ status: 'invisible' });
  }
  else return;
});
INDIA.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] India (' + INDIA.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return INDIA.user.setPresence({ status: 'invisible' });
  }
  else return;
});
JULIET.on('ready', () => {
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Juliet (' + JULIET.user.tag + ') is logged in.');
  if (MAIN.config.TOKENS.Hide_Bot_Tokens == 'ENABLED') {
    return JULIET.user.setPresence({ status: 'invisible' });
  }
  else return;
});

// LOG IN BOTS AND ADD TO BOT ARRAY
async function bot_login() {
  let token = MAIN.config.TOKENS;
  console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Main...');
  await MAIN.login(token.MAIN);
  if (token.BOT_TOKENS[0] && token.BOT_TOKENS[0] != 'TOKEN') {
    await MAIN.BOTS.push(ALPHA); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Alpha...');
    await ALPHA.login(token.BOT_TOKENS[0]);
  }
  if (token.BOT_TOKENS[1] && token.BOT_TOKENS[1] != 'TOKEN') {
    MAIN.BOTS.push(BRAVO); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Bravo...');
    await BRAVO.login(token.BOT_TOKENS[1]);
  }
  if (token.BOT_TOKENS[2] && token.BOT_TOKENS[2] != 'TOKEN') {
    MAIN.BOTS.push(CHARLIE); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Charlie...');
    await CHARLIE.login(token.BOT_TOKENS[2]);
  }
  if (token.BOT_TOKENS[3] && token.BOT_TOKENS[3] != 'TOKEN') {
    MAIN.BOTS.push(DELTA); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Delta...');
    await DELTA.login(token.BOT_TOKENS[3]);
  }
  if (token.BOT_TOKENS[4] && token.BOT_TOKENS[4] != 'TOKEN') {
    MAIN.BOTS.push(ECHO); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Echo...');
    await ECHO.login(token.BOT_TOKENS[4]);
  }
  if (token.BOT_TOKENS[5] && token.BOT_TOKENS[5] != 'TOKEN') {
    MAIN.BOTS.push(FOXTROT); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Foxtrot...');
    await FOXTROT.login(token.BOT_TOKENS[5]);
  }
  if (token.BOT_TOKENS[6] && token.BOT_TOKENS[6] != 'TOKEN') {
    MAIN.BOTS.push(GULF); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Gulf...');
    await GULF.login(token.BOT_TOKENS[6]);
  }
  if (token.BOT_TOKENS[7] && token.BOT_TOKENS[7] != 'TOKEN') {
    MAIN.BOTS.push(HOTEL); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Hotel...');
    await HOTEL.login(token.BOT_TOKENS[7]);
  }
  if (token.BOT_TOKENS[8] && token.BOT_TOKENS[8] != 'TOKEN') {
    MAIN.BOTS.push(INDIA); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in India...');
    await INDIA.login(token.BOT_TOKENS[8]);
  }
  if (token.BOT_TOKENS[9] && token.BOT_TOKENS[9] != 'TOKEN') {
    MAIN.BOTS.push(JULIET); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Logging in Juliet...');
    await JULIET.login(token.BOT_TOKENS[9]);
  }
  if (MAIN.config.DEBUG.Quests == 'ENABLED') {
    await console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Quest Debugging is ENABLED.');
  }
  if (MAIN.config.DEBUG.Raids == 'ENABLED') {
    await console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Raid Debugging is ENABLED.');
  }
  if (MAIN.config.DEBUG.Pokemon == 'ENABLED') {
    await console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Pokemon Debugging is ENABLED.');
  }
  if (MAIN.config.DEBUG.Subscriptions == 'ENABLED') {
    await console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Subscription Debugging is ENABLED.');
  }
  if (MAIN.config.CONSOLE_LOGS == 'ENABLED') {
    await console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Console Logging is ENABLED');
  } console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Start-Up] Pokébot is Ready.');

  // SET ACTIVE BOOLEAN TO TRUE AND BOT POOL TO ZERO
  MAIN.Active = true; MAIN.Next_Bot = 0;

  // CHECK FOR CUSTOM EMOTES (CHUCKLESLOVE MERGE)
  MAIN.emotes = new Emojis.DiscordEmojis();
  MAIN.reloadEmojis();
  //MAIN.Purge_Channels();
  return MAIN.emotes.Load(MAIN);
}

var ontime_servers = [], ontime_times = [];
MAIN.Discord.Servers.forEach(function (server) {

  let server_purge = moment(), timezone = GeoTz(server.geofence[0][0][1], server.geofence[0][0][0]);
  server_purge = moment.tz(server_purge, timezone[0]).set({ hour: 00, minute: 14, second: 30, millisecond: 0 });
  server_purge = moment.tz(server_purge, MAIN.config.TIMEZONE).format('HH:mm:ss');
  if (server.purge_channels == 'ENABLED') {
    console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Channel purge set for ' + server.name + ' at ' + server_purge);
  }
  ontime_times.push(server_purge);
  ontime_servers.push(server);
});

MAIN.reloadEmojis = () => {
  //MAKE SURE WE HAVE THE RIGHT EMOJIS
  MAIN.start('reload');

  // LOAD RAID BOSS EMOJIS
  MAIN.Raid_Boss_Emojis = new Discord.Collection();
  let bosspokemons = MAIN.config.RAIDBOSSES.Pokemon;
  bosspokemons.forEach((p, i) => {
    let emoji = MAIN.emojis.find(e => e.name == p);
    if (emoji != null) {
      MAIN.Raid_Boss_Emojis.set(emoji.id, emoji)
    };
  });

  // LOAD POKEMON SUB EMOJIS
  MAIN.Pokemon_Sub_Emojis = new Discord.Collection();
  let subpokemons = MAIN.config.SUBPOKEMON.Pokemon;
  subpokemons.forEach((p, i) => {
    let emoji = MAIN.emojis.find(e => e.name == p);
    if (emoji != null) { MAIN.Pokemon_Sub_Emojis.set(emoji.id, emoji) }
  });

  // LOAD QUEST SUBS
  let despacedRewards = MAIN.config.QUEST.Rewards.map(reward => reward.replace(/\s+/g, ''));
  // LOAD QUEST ENCOUNTER EMOJIS
  MAIN.Quest_Encounter_Emojis = new Discord.Collection();
  let encounterRewards = despacedRewards.slice((despacedRewards.indexOf("UltraBall") + 1));
  encounterRewards.forEach((p, i) => {
    let emoji = MAIN.emojis.find(e => e.name == p);
    if (emoji != null) { MAIN.Quest_Encounter_Emojis.set(emoji.id, emoji) }
  });
  // LOAD QUEST ITEM EMOJIS
  MAIN.Quest_Item_Emojis = new Discord.Collection();
  let itemRewards = despacedRewards.slice(0, despacedRewards.indexOf("UltraBall"));
  itemRewards.forEach((p, i) => {
    let emoji = MAIN.emojis.find(e => e.name == p);
    if (emoji != null) { MAIN.Quest_Item_Emojis.set(emoji.id, emoji); }
  });
  //SETUP SUB CHANNEL EMOJIS AND SUB ROLES
  MAIN.Discord.Servers.forEach(function (server) {
    if (server.command_channels){
      MAIN.Sub_Roles = new Discord.Collection();
      let roles = MAIN.channels.get(server.command_channels[0]).guild.roles
      MAIN.Raid_Channels.forEach((geo, i) => {
        let role = roles.find(r => r.name == geo[1].geofences)
        if (role != null) {
          MAIN.Sub_Roles.set(role.id, role)
          console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Setup] Loaded role: ' + role.name);
        } else {
          MAIN.channels.get(server.command_channels[0]).guild.createRole({
            name: geo[1].geofences
          })
          .then(newRole => {
            MAIN.Sub_Roles.set(newRole.id, newRole)
            console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Setup] Created new role: ' + newRole.name);
          })
          .catch(console.error)
        }
      })
      MAIN.channels.get(server.command_channels[0]).fetchMessages().then(async messages => {
        let pokemonlocalmsg = messages.filter(msg => msg.content.includes('WILD POKEMON you want to be notified of in: YOUR'));
        let pokemonglobalmsg = messages.filter(msg => msg.content.includes('WILD POKEMON you want to be notified of in: ALL OF'));
        let raidlocalmsg = messages.filter(msg => msg.content.includes('RAID BOSS you want to be notified of in: YOUR'));
        let raidglobalmsg = messages.filter(msg => msg.content.includes('RAID BOSS you want to be notified of in: ALL OF'));
        if (pokemonlocalmsg){
          server.pokemonlocalmsg = pokemonlocalmsg.firstKey();
        }
        if (pokemonglobalmsg){
          server.pokemonglobalmsg = pokemonglobalmsg.firstKey();
        }
        if (raidlocalmsg){
          server.raidlocalmsg = raidlocalmsg.firstKey();
        }
        if (raidglobalmsg){
          server.raidglobalmsg = raidglobalmsg.firstKey();
        }
        if(!server.pokemonlocalmsg || !server.pokemonglobalmsg || !server.raidlocalmsg || !server.raidglobalmsg){
          resetSubChannel(server)
        }
      })
    }
  });
}

// GET CHANNELS FOR PURGING
MAIN.Purge_Channels = () => {
  let now = moment().format('HH:mm') + ':00';
  ontime_servers.forEach(function (server) {
    if (server.purge_channels == 'ENABLED') {
      let purge_time = moment(), timezone = GeoTz(server.geofence[0][1][1], server.geofence[0][1][0]);
      purge_time = moment.tz(purge_time, timezone[0]).set({ hour: 23, minute: 53, second: 30, millisecond: 0 });
      purge_time = moment.tz(purge_time, MAIN.config.TIMEZONE).format('HH:mm:ss');
      //if (now == purge_time) {
        if (purge_time) {
        console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Ontime channel purge has started for ' + server.name);
        for (var i = 0; i < server.channels_to_purge.length; i++) { clear_channel(server.channels_to_purge[i]); }
        for (var i = 0; i < MAIN.Raid_Channels.length; i++) {
          clear_unpinned_raid_channel(MAIN.Raid_Channels[i][1].chat); 
          clear_unpinned_channel(MAIN.Raid_Channels[i][0])
        }
        for (var i = 0; i < MAIN.Quest_Channels.length; i++) { clear_unpinned_channel(MAIN.Quest_Channels[i][0]); }
        for (var i = 0; i < MAIN.Pokemon_Channels.length; i++) { clear_unpinned_channel(MAIN.Pokemon_Channels[i][0]); }
        for(var i = 0; i < server.spam_channels.length; i++) { clear_unpinned_channel(MAIN.channels.get(server.spam_channels[i]))}
      }
    }
  }); return;
}

MAIN.Reset_Quest_Channels = (server) => {
  resetQuestChannels(server);
  return;
}

MAIN.Reset_Raid_Channels = (server) => {
  resetRaidChannels(server);
  return;
}

MAIN.Reset_Raid_Emojis = (server) => {
  resetRaidEmojis(server);
  return;
}

MAIN.Reset_Quest_Emojis = (server) => {
  resetQuestEmojis(server)
  return;
}
MAIN.Reset_Sub_Channel = (server) => {
  resetSubChannel(server)
  return;
}
MAIN.Reset_Sub_Emojis = (server) => {
  resetSubChannelEmojis(server)
  return;
}

async function resetSubChannelEmojis(server) {
  MAIN.reloadEmojis();
  let pokemonEmojis = MAIN.Pokemon_Sub_Emojis;
  let raidEmojis = MAIN.Raid_Boss_Emojis;
  let channel_id = server.command_channels[0];
  let channel = await MAIN.channels.get(channel_id);
  let permissions = channel.permissionOverwrites;
  await permissions.tap(async permission => {
    await channel.replacePermissionOverwrites({
      overwrites: [
        {
          id: permission.id,
          denied: ['USE_EXTERNAL_EMOJIS'],
        },
      ]
    })
  });
  channel.fetchMessages({ limit: 99 }).catch(console.error).then(async (msgIDs) => {
    if (msgIDs.size) {
      for (const msgid of msgIDs) {
        let promises = [];
        let subEmojis = [];
        let cmd = '';
        let msg = await channel.fetchMessage(msgid[0]).catch(console.error);
        if (msg.content.toLowerCase().includes("wild pokemon")) { subEmojis = pokemonEmojis; cmd = 'emojiPokemon'; }
        else if (msg.content.toLowerCase().includes("raid boss")) { subEmojis = raidEmojis; cmd = 'emojiRaid'; }
        if (subEmojis.size > 0) {
          for (const reaction of msg.reactions) {
            if (!subEmojis.has(reaction[1].emoji.id)) {
              let users = await reaction[1].fetchUsers().catch(console.error);
              for (const user of users) {
                let p = reaction[1].remove(user[1]).catch(console.error);
                promises.push(p);
                if (!user[1].bot) {
                  MAIN.Commands.get(cmd).run(MAIN, 'MESSAGE_REACTION_REMOVE', server, msg, user[0], reaction[1].emoji.name)
                }

              }
            }
          }
          Promise.all(promises).then(async () => {
            for (const emoji of subEmojis) {
              if (!msg.reactions.has(emoji[1].identifier)) {
                if (!emoji[1].name.toLowerCase().includes("all")) {
                  await msg.react(emoji[1]).catch(console.error)
                }
              }
            }
          })
          .then(() => channel.lockPermissions());
        }
      }
    }
  });
}

async function resetSubChannel(server) {
  MAIN.reloadEmojis();
  let subEmojis = MAIN.Pokemon_Sub_Emojis;
  let channel_id = server.command_channels[0];
  let channel = await MAIN.channels.get(channel_id);
  let permissions = channel.permissionOverwrites;
  let icon = MAIN.emotes.exPassreact.url;
  let raidpass = MAIN.emojis.find(e => e.name == "RaidPass");
  let ball = MAIN.emojis.find(e => e.name == "UltraBall");
  let sub_embed = new Discord.RichEmbed()
    .setTitle("React with your area below")
    .setFooter("Visit the linked channels for per-gym subscriptions!");
  await permissions.tap(async permission => {
    await channel.replacePermissionOverwrites({
      overwrites: [
        {
          id: permission.id,
          denied: ['VIEW_CHANNEL'],
        },
      ]
    })
  });
  clear_channel(channel_id).then(async (clrd) => {
    let usedLetters = [];
    let unusedLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    let geofence = await MAIN.Geofences.get(server.geojson_file);
    let index = 1;
    let recheck = [];
    let toReact = [];
    let toAdd = new Map();
    MAIN.Raid_Channels.forEach((geo, i) => {
      let letter = "";
      let letterIndex = geo[1].geofences.charAt(0).toLowerCase();
      if (unusedLetters.indexOf(letterIndex) > 0) {
        letter = geo[1].geofences.charAt(0).toLowerCase();
        unusedLetters.splice(unusedLetters.indexOf(letter), 1);
        sub_embed.addField(unicodeEmojis[letter] + geo[1].geofences.toUpperCase(), "<#" + geo[1].chat + ">", true);
        toReact.push(unicodeEmojis[letter]);
      } else {
        recheck.push(geo);
      }
    });
    recheck.forEach((geo, i) => {
      let letter = "";
      let letterIndex = 1;
      while (unusedLetters.indexOf(geo[1].geofences.charAt(letterIndex).toLowerCase()) < 0) {
        if (letterIndex > geo[1].geofences.length) { break }
        letterIndex++;
      }
      if (letter == "") { letter = unusedLetters[0] }
      unusedLetters.splice(unusedLetters.indexOf(letter), 1);
      sub_embed.addField(unicodeEmojis[letter] + geo[1].geofences.toUpperCase(), "<#" + geo[0] + ">", true);
      toReact.push(unicodeEmojis[letter]);
    });
    let msg = await channel.send(sub_embed).catch(console.error);
    for (const emoji of toReact) {
      await msg.react(emoji).catch(console.error);
    }
  }).then(() => {
      //Commented out embeds here due to how they look on mobile, if discord fixes them, will revert

      //let raid_info = new Discord.RichEmbed();
      //raid_info.setDescription("React below with the **WILD POKEMON** you want to be notified of in: **YOUR AREA(S)**");
      //raid_info.setColor('00ccff')
      if(!server.pokemonlocalmsg){
        channel.send(ball.toString() + "***React below with the WILD POKEMON you want to be notified of in: YOUR AREA(S)***")
        .then(async (msg) => {
          server.pokemonlocalmsg = msg.id
          for (const emoji of subEmojis) {
            await msg.react(emoji[1]).catch(console.error);
          }
        }).catch(console.error);
      }
      
    }).then(() => {
      //let raid_info = new Discord.RichEmbed();
      //raid_info.setDescription("React below with the **WILD POKEMON** you want to be notified of in: **ALL OF " + server.name.toUpperCase() + "**");
      //raid_info.setColor('00ccff')
      if(!server.pokemonglobalmsg){
        channel.send(ball.toString() + "***React below with the WILD POKEMON you want to be notified of in: ALL OF " + server.name.toUpperCase() + "***")
        .then(async (msg) => {
          server.pokemonglobalmsg = msg.id
          for (const emoji of subEmojis) {
            await msg.react(emoji[1]).catch(console.error);
          }
      }).catch(console.error);
    }
      
      }).then(() => {
        //let raid_info = new Discord.RichEmbed();
        //raid_info.setColor("f358fb");
        //raid_info.setDescription("React below with the **RAID BOSS** you want to be notified of in: **YOUR AREA(S)**");
        if(!server.raidlocalmsg){
        channel.send(raidpass.toString() + "***React below with the RAID BOSS you want to be notified of in: YOUR AREA(S)***")
        .then(async (msg) => {
          server.raidlocalmsg = msg.id
          for (const emoji of MAIN.Raid_Boss_Emojis) {
            if (!emoji[1].name.toLowerCase().includes("all")) {
              await msg.react(emoji[1]).catch(console.error)
            }
          }
        }).catch(console.error);
      }
      }).then(() => {
        //let raid_info = new Discord.RichEmbed();
        //raid_info.setColor("f358fb");
        //raid_info.setDescription("React below with the **raid boss** you want to be notified of in: **ALL OF " + server.name.toUpperCase() + "**", icon);
        if(!server.raidglobalmsg){
        channel.send(raidpass.toString() + "***React below with the RAID BOSS you want to be notified of in: ALL OF " + server.name.toUpperCase() + "***")
        .then(async (msg) => {
          server.raidglobalmsg = msg.id
          for (const emoji of MAIN.Raid_Boss_Emojis) {
            if (!emoji[1].name.toLowerCase().includes("all")) {
              await msg.react(emoji[1]).catch(console.error)
            }
          }
        }).catch(console.error);
      }
      }).then(() => {
          //let info_embed = new Discord.RichEmbed();
          //info_embed.addField("Don't like these options? Type !p for fully customized pokemon alerts, including CP, IV, level and more!");
          //info_embed.addField("Want customized ")
          channel.send("```Don't like these options?\r\nType !p for fully customized pokemon alerts, including CP, IV, level and more!\r\nType !r for fully customized raid alerts!\r\nType !q for customized quest alerts!```")
        })
        .then(() => channel.lockPermissions())
        .catch(console.error);
    //});
}

async function resetQuestChannels(server) {
  MAIN.reloadEmojis();
  let encounterEmojis = MAIN.Quest_Encounter_Emojis;
  let itemEmojis = MAIN.Quest_Item_Emojis;

  for (const questChannel of MAIN.Quest_Channels) {
    let channel_id = await questChannel[0];
    let channel = await MAIN.channels.get(channel_id);
    let permissions = channel.permissionOverwrites;
    await permissions.tap(async permission => {
      await channel.replacePermissionOverwrites({
        overwrites: [
          {
            id: permission.id,
            denied: ['VIEW_CHANNEL'],
          },
        ]
      })
    });
    clear_channel(channel_id).then((clrd) => {
      if (questChannel[1].filter == "Quest_Encounters.json") {
        let questString = "QUEST ENCOUNTER REWARDS";
        let emojiArray = encounterEmojis;
        console.log(questChannel[1].filter);
        channel.send(questString)
          .then((msg) => msg.pin())
          .then(async (msg) => {
            for (const emoji of emojiArray) {
              await msg.react(emoji[1]);
            }
          }).catch(console.error);
      } else if (questChannel[1].filter == "Quest_Items.json") {
        let questString = "QUEST ITEM REWARDS";
        let emojiArray = itemEmojis;
        console.log(questChannel[1].filter);
        channel.send(questString)
          .then((msg) => msg.pin())
          .then(async (msg) => {
            for (const emoji of emojiArray) {
              await msg.react(emoji[1]);
            }
          }).catch(console.error);
      }
    })
      .then(() => channel.send("Don't like these options? Go to " + "<#" + server.command_channels[0] + ">" + " and type !q for fully customized quest alerts, including delivery time!")).then((msg) => msg.pin())
      .then(() => clear_unpinned_channel(channel_id))
      .then(() => channel.lockPermissions())
  }
}

async function resetQuestEmojis(server) {
  MAIN.reloadEmojis();
  let encounterEmojis = MAIN.Quest_Encounter_Emojis;
  let itemEmojis = MAIN.Quest_Item_Emojis;

  for (var i = 0; i < MAIN.Quest_Channels.length; i++) {
    let questString = "";
    let emojiArray = [];
    if (MAIN.Quest_Channels[i][1].filter.includes("Encounters") || MAIN.Quest_Channels[i][1].filter.includes("encounters")) {
      questString = "QUEST ENCOUNTER REWARDS";
      emojiArray = encounterEmojis;
    } else if (MAIN.Quest_Channels[i][1].filter.includes("Item") || MAIN.Quest_Channels[i][1].filter.includes("item")) {
      questString = "QUEST ITEM REWARDS";
      emojiArray = itemEmojis;
    }
    console.log(MAIN.Quest_Channels[i][1].filter);
    let channel_id = await MAIN.Quest_Channels[i][0];
    let channel = await MAIN.channels.get(channel_id);
    let permissions = channel.permissionOverwrites;
    await permissions.tap(async permission => {
      await channel.replacePermissionOverwrites({
        overwrites: [
          {
            id: permission.id,
            denied: ['USE_EXTERNAL_EMOJIS'],
          },
        ]
      })
    });
    clear_unpinned_channel(channel_id).then(async (clrd) => {
      channel.fetchMessages({ limit: 99 }).catch(console.error).then(async (msgIDs) => {
        if (msgIDs.size) {
          for (const msgid of msgIDs) {
            let promises = [];
            if (msgid[1].content == questString) {
              let msg = await channel.fetchMessage(msgid[0]).catch(console.error);
              for (const reaction of msg.reactions) {
                if (!emojiArray.has(reaction[1].emoji.id)) {
                  let users = await reaction[1].fetchUsers().catch(console.error);
                  for (const user of users) {
                    let p = reaction[1].remove(user[1]).catch(console.error);
                    promises.push(p);
                    if (!user[1].bot) {
                      MAIN.Commands.get('emojiQuest').run(MAIN, 'MESSAGE_REACTION_REMOVE', server, msg, user[0], reaction[1].emoji.name)
                    }
                  }
                }
              }
              Promise.all(promises).then(async () => {
                for (const emoji of emojiArray) {
                  if (!msg.reactions.has(emoji[1].identifier)) {
                    await msg.react(emoji[1]);
                  }
                }
              });
            }
          }
        } else {
          resetQuestChannels(server)
        }
      });
    })
    .then(() => channel.lockPermissions())
  }
}

async function resetRaidEmojis(server) {
  MAIN.reloadEmojis();
  console.log("Changing Raid Emojis")
  for (var i = 0; i < MAIN.Raid_Channels.length; i++) {
    let channel_id = await MAIN.Raid_Channels[i][1].chat;
    let channel = await MAIN.channels.get(channel_id);
    let subEmojis = MAIN.Raid_Boss_Emojis;
    var lookup = [];
    for (var j in subEmojis) {
      lookup[subEmojis[j].identifier] = subEmojis[j].identifier
    }
    let raid_channel = await MAIN.Raid_Channels.find(p => p[0] === channel_id);
    channel.fetchMessages({ limit: 99 }).catch(console.error).then(async (msgIDs) => {
      if (msgIDs.size) {
        for (const msgid of msgIDs) {
          let promises = [];
          let reacted = [];
          let x = Math.floor(Math.random() * 4)
          let msg = await MAIN.BOTS[x].channels.get(channel_id).fetchMessage(msgid[0]).catch(console.error);
          for (const reaction of msg.reactions) {
            if (!subEmojis.has(reaction[1].emoji.id)) {
              let users = await reaction[1].fetchUsers().catch(console.error);
              for (const user of users) {
                let p = reaction[1].remove(user[1]).catch(console.error);
                promises.push(p);
                if (!user[1].bot) {
                  MAIN.Commands.get('emojiRaid').run(MAIN, 'MESSAGE_REACTION_REMOVE', server, msg, user[0], reaction[1].emoji.name)
                }
              }
            }
          }
          Promise.all(promises).then(async () => {
            for (const emoji of subEmojis) {
              if (!msg.reactions.has(emoji[1].identifier)) {
                await msg.react(emoji[1]);
              }
            }
          });
        }
      }
    });
  }
}
async function resetRaidChannels(server) {
  MAIN.reloadEmojis();
  for (var i = 0; i < MAIN.Raid_Channels.length; i++) {
    let channel_id = await MAIN.Raid_Channels[i][1].chat;
    let geofenceName = MAIN.Raid_Channels[i][1].geofences;
    let channel = await MAIN.channels.get(channel_id);
    let subEmojis = MAIN.Raid_Boss_Emojis;
    let permissions = channel.permissionOverwrites;
    permissions.tap(async permission => {
      channel.replacePermissionOverwrites({
        overwrites: [
          {
            id: permission.id,
            denied: ['VIEW_CHANNEL'],
          },
        ]
      })
    });
    clear_channel(channel_id).then(async (clrd) => {
      //let raid_channel = await MAIN.Raid_Channels.find(p => p[0] === channel_id);
      let postedGyms = [];
      let Gyms = await MAIN.gym_array;
      let geofence = await MAIN.Geofences.get(server.geojson_file);
      let gymstoUpdate = [];
      await channel.fetchMessages({ limit: 99 }).then(messages => {
        console.log("Fetching message in " + geofenceName);
        if (Array.isArray(messages) || messages.length) {
          postedGyms = messages.map(msg => msg.embeds[0].author && msg.content == "");
          console.log("Fetched " + postedGyms.length + " messages");
        }
      });
      for (var i = 0; Gyms.length > i; i++) {
        geofence.features.filter(feature => feature.properties.name === geofenceName).forEach((geo, index) => {
          if (InsideGeojson.polygon(geo.geometry.coordinates, [Gyms[i].lon, Gyms[i].lat])) {
            if (Array.isArray(postedGyms) && Gyms[i].name.length > 0 && postedGyms.indexOf(Gyms[i].name) < 0) {
              console.log("Adding " + Gyms[i].name + " to list of gyms to update in " + geofenceName);
              gymstoUpdate.push(Gyms[i]);
            }
          }
        });
      }
      for (const gym of gymstoUpdate) {
        let gym_embed = new Discord.RichEmbed();
        let icon = "";
        gym_embed.set
        if (gym.ex_raid_eligible) {
          icon = MAIN.emotes.exPassreact.url;
          gym_embed.setColor('WHITE');
        }
        gym_embed.setAuthor(gym.name, icon, 'https://www.google.com/maps/search/?api=1&query=' + gym.lat + "," + gym.lon);
        let msg = await channel.send(gym_embed)
          .catch(console.error)
        for (const emoji of subEmojis) {
          await msg.react(emoji[1]).catch(console.error)
        }
      }
    })
    .then(() => channel.lockPermissions())
  }
}

// PURGE CHANNEL
function clear_unpinned_channel(channel_id) {
  console.log(channel_id);
  //should check to see if these are pinned
  return new Promise(async function (resolve) {
    let channel = await MAIN.channels.get(channel_id);
    console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Purging all unpinned messages in ' + channel.name + ' (' + channel.id + ')');
    if (!channel) { resolve(false); return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Could not find a channel with ID: ' + channel_id); }
    channel.fetchMessages({ limit: 99 }).then(messages => {
      let unpinned = messages.filter(msg => !msg.pinned);
      channel.bulkDelete(unpinned).then(deleted => {
        if (deleted.size > (messages.size - unpinned.size)) { 
          clear_unpinned_channel(channel_id).then(result => { return resolve(true); }); }
        else {
          console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Purged all unpinned messages in ' + channel.name + ' (' + channel.id + ')');
          return resolve(true);
        }
      }).catch(console.error);
    });
  });


}

// PURGE CHANNEL
function clear_unpinned_raid_channel(channel_id) {
  console.log(channel_id);
  //should check to see if these are pinned
  return new Promise(async function (resolve) {
    let channel = await MAIN.channels.get(channel_id);
    console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Purging all unpinned messages in ' + channel.name + ' (' + channel.id + ')');
    if (!channel) { resolve(false); return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Could not find a channel with ID: ' + channel_id); }
    channel.fetchMessages({ limit: 99 }).then(messages => {
      let unembedded = messages.filter(msg => !msg.pinned);
      let unpinned = unembedded.filter(msg => msg.embeds.length == 0);
      channel.bulkDelete(unpinned).then(deleted => {
        if (deleted.size > (messages.size - unpinned.size)) { clear_unpinned_raid_channel(channel_id).then(result => { return resolve(true); }); }
        else {
          console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Purged all unpinned messages in ' + channel.name + ' (' + channel.id + ')');
          return resolve(true);
        }
      }).catch(console.error);
    });
  });
}

// PURGE CHANNEL
function clear_channel(channel_id) {
  console.log(channel_id);
  return new Promise(async function (resolve) {
    let channel = await MAIN.channels.get(channel_id);
    console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Purging all messages in ' + channel.name + ' (' + channel.id + ')');
    if (!channel) { resolve(false); return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Could not find a channel with ID: ' + channel_id); }
    channel.fetchMessages({ limit: 99 }).then(messages => {
      channel.bulkDelete(messages).then(deleted => {
        if (messages.size > 0) { clear_channel(channel_id).then(result => { return resolve(true); }); }
        else {
          console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Purged all messages in ' + channel.name + ' (' + channel.id + ')');
          return resolve(true);
        }
      }).catch(console.error);
    });
  });


}

// CHANNEL PURGING
Ontime({ cycle: ontime_times }, function (ot) { MAIN.Purge_Channels(); return ot.done(); });

// CHECK DATABASE FOR UPGRADED OR REMOVED POKESTOPS
let check_time = moment();
check_time = moment.tz(check_time, 'America/Los_Angeles').set({ hour: 00, minute: 06, second: 0, millisecond: 0 });
check_time = moment.tz(check_time, MAIN.config.TIMEZONE).format('HH:mm:ss');
Ontime({ cycle: check_time }, async function (ot) {
  if (MAIN.config.rdmDB.Remove_Upgraded_Pokestops == 'ENABLED') {
    await MAIN.rdmdb.query('UPDATE gym INNER JOIN pokestop ON gym.id = pokestop.id SET gym.name = pokestop.name, gym.url = pokestop.url WHERE gym.id = pokestop.id', function (error, record, fields) {
      if (error) { console.error(error); }
    });
    MAIN.rdmdb.query('DELETE FROM pokestop WHERE id IN (SELECT id FROM gym)', function (error, record, fields) {
      if (error) { console.error(error); }
    }); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Ran Query to remove Upgraded Pokestops.');
  }
  if (MAIN.config.rdmDB.Remove_Unseen_Pokestops == 'ENABLED') {
    MAIN.rdmdb.query('DELETE FROM pokestop WHERE updated < UNIX_TIMESTAMP()-90000', function (error, record, fields) {
      if (error) { console.error(error); }
    }); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Ran Query to remove Stale Pokestops.');
  }
  if (MAIN.config.rdmDB.Trim_Pokemon_Table == 'ENABLED') {
    let prune_time = parseInt(MAIN.config.rdmDB.Trim_Days) * 86400;
    MAIN.rdmdb.query('DELETE FROM pokemon WHERE updated < UNIX_TIMESTAMP()-' + prune_time, function (error, record, fields) {
      if (error) { console.error(error); }
    }); console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Ontime] Ran Query to trim Pokemon table.');
  }
  return ot.done();
});

// CRANK UP THE BOT
MAIN.start = async (type) => {
  await load_data();
  await update_database();
  await load_arrays();
  Reactions.startInterval(MAIN);
  switch (type) {
    case 'startup': return bot_login(); break;
    case 'reload': return console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Re-Load] Pokébot has re-loaded.'); break;
    default: return;
  }
}
MAIN.start('startup');

MAIN.restart = () => {
  process.exit(1).catch(console.error);
  return;
}

// INTERVAL FUNCTION TO SEND QUEST SUBSCRIPTION DMS
setInterval(function () {
  MAIN.pdb.query(`SELECT * FROM quest_alerts WHERE alert_time < UNIX_TIMESTAMP()*1000`, function (error, alerts, fields) {
    if (alerts && alerts[0]) {
      alerts.forEach(async (alert, index) => {
        setTimeout(async function () {
          let guild = MAIN.BOTS[alert.bot].guilds.get(alert.discord_id);
          let user = guild.fetchMember(alert.user_id).catch(error => { console.error('[BAD USER ID] ' + alert.user_id, error); });
          MAIN.BOTS[alert.bot].guilds.get(alert.discord_id).fetchMember(alert.user_id).then(TARGET => {
            let quest_embed = JSON.parse(alert.embed);
            let alert_embed = new Discord.RichEmbed()
              .setColor(quest_embed.color)
              .setThumbnail(quest_embed.thumbnail.url)
              .addField(quest_embed.fields[0].name, quest_embed.fields[0].value, false)
              .addField(quest_embed.fields[1].name, quest_embed.fields[1].value, false)
              .addField(quest_embed.fields[2].name, quest_embed.fields[2].value, false)
              .setImage(quest_embed.image.url)
              .setFooter(quest_embed.footer.text);
            TARGET.send(alert_embed).catch(error => {
              return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] ' + TARGET.user.tag + ' (' + alert.user_id + ') , CANNOT SEND THIS USER A MESSAGE.', error);
            });
          });
        }, 2000 * index);
      });
      console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] Sent ' + alerts.length + ' Quest Alerts out.');
      MAIN.pdb.query(`DELETE FROM quest_alerts WHERE alert_time < UNIX_TIMESTAMP()*1000`, function (error, alerts, fields) { if (error) { console.error; } });
    }
  });
  MAIN.pdb.query(`SELECT * FROM active_raids WHERE expire_time < UNIX_TIMESTAMP() AND boss_name != "expired"`, function (error, active_raids, fields) {
    if (active_raids[0]) {
      active_raids.forEach(async (raid, index) => {
        let raid_channel = MAIN.channels.get(raid.raid_channel);
        if (raid_channel) {
          raid_channel.setName('expired').catch(console.error)
          raid_channel.send('Raid has ended, channel will delete in 15 minutes. Wrap up converation or join another raid lobby.').catch(console.error);
        }
      });
      MAIN.pdb.query(`UPDATE active_raids set boss_name = "expired" WHERE expire_time < UNIX_TIMESTAMP()`, function (error, fields) { if (error) { console.error; } });
    }
  });
  MAIN.pdb.query(`SELECT * FROM active_raids WHERE expire_time < UNIX_TIMESTAMP()-900`, function (error, active_raids, fields) {
    if (active_raids[0]) {
      active_raids.forEach(async (raid, index) => {
        let raid_channel = MAIN.channels.get(raid.raid_channel);
        let raid_role = '';
        if (raid_channel) { raid_role = raid_channel.guild.roles.get(raid.role_id); raid_channel.delete().catch(console.error); }
        if (raid_role) { raid_role.delete().catch(console.error); }
      });
      MAIN.pdb.query(`DELETE FROM active_raids WHERE expire_time < UNIX_TIMESTAMP()-900`, function (error, active_raids, fields) { if (error) { console.error; } });
    }
  }); return;
}, 60000);

module.exports = MAIN;
