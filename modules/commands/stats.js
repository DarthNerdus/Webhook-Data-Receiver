const GeoTz = require('geo-tz');
const Discord = require('discord.js');
const Send_Nest = require('../embeds/nests.js');
const InsideGeojson = require('point-in-geopolygon');

module.exports.run = async (MAIN, message, prefix, discord) => {

  // DECLARE VARIABLES
  let nickname = '';

  // GET USER NICKNAME
  if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }

  let requestAction = new Discord.RichEmbed()
    .setAuthor(nickname, message.member.user.displayAvatarURL)
    .setTitle('What Pokémon do you want stats for?')
    .setFooter('Type the name of desired Poké, no command prefix required.');

  message.channel.send(requestAction).catch(console.error).then( msg => {
      initiate_collector(MAIN, 'start', message, msg, nickname, prefix, discord);
      if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0){ return message.delete(); } else {
        return;
      }
  });

}

async function pokemon_view(MAIN, message, nickname, pokemon, prefix, discord){
  let guild = MAIN.guilds.get(message.guild.id);

  hours = pokemon[1];
  pokemon = pokemon[0];

  message.reply('Searching... this may take a minute. Check your inbox if not in the channel.').then(m => m.delete(5000)).catch(console.error);
  let search = '';
  if (pokemon != 'ALL') {search = 'pokemon_id = ? AND '; }
      MAIN.rdmdb.query(`SELECT count(*) as count FROM pokemon WHERE `+search+`last_modified>= UTC_TIMESTAMP()-INTERVAL ? HOUR`, [pokemon,hours], function (error, stats, fields) {
        let pokemon_count = stats[0].count, role_id = '';
        if (pokemon == 'ALL'){ pokemon_name = 'ALL'; }
        else { pokemon_name = MAIN.masterfile.pokemon[pokemon].name; }
        stat_message = 'There have been '+pokemon_count+' '+pokemon_name+' seen in last ' +hours+ ' hours';

        if(discord.spam_channels.indexOf(message.channel.id) >= 0){
          return message.reply(stat_message);
        } else {
          guild.fetchMember(message.author.id).then( TARGET => {
            return TARGET.send(stat_message).catch(console.error);
          });
        }
      });
}

async function initiate_collector(MAIN, source, message, msg, nickname, prefix, discord){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.member.id == message.member.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });
  let msg_count = 0;

  // FILTER COLLECT EVENT
  await collector.on('collect', message => {
   if(MAIN.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0){ message.delete(); }
   args = message.content.split(' ');
   let hours = 1;
   if(args[1]) { hours = args[1]; }
   pokemon = capitalize(args[0]);
   if (pokemon != 'NaN' && pokemon < 809) {
     collector.stop([pokemon,hours]);
   }
   if (pokemon == 'All'){ collector.stop(['ALL',hours]); }

   for (key in MAIN.masterfile.pokemon) {
      if (MAIN.masterfile.pokemon[key].name === pokemon) {
        pokemon = key;
        collector.stop([pokemon,hours]);
        break;
      }
    }
    if (pokemon.toLowerCase() === 'cancel' || pokemon.toLowerCase() === 'time'){
      collector.stop([pokemon,hours]);
    } else { collector.stop(['retry',hours]); }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch(reason[0]){
      case 'cancel': break;
      case 'time': if(source == 'start'){
        message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
      } break;
      case 'retry':
       message.reply('Please check your spelling, and retry.').then(m => m.delete(5000)).catch(console.error);
      break;
      default:
        pokemon_view(MAIN, message, nickname, reason, prefix, discord);
    } return;
  });
}
const capitalize = (s) => {
 if (typeof s !== 'string') {return '';}
 s = s.toLowerCase();
 return s.charAt(0).toUpperCase() + s.slice(1)
}
