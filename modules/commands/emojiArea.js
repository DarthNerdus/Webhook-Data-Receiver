const Discord = require('discord.js');
const insideGeofence = require('point-in-polygon');
const insideGeojson = require('point-in-geopolygon');

module.exports.run = async (MAIN, action, discord, message, memberid, emojiName) => {
  let guild = await MAIN.guilds.get(message.guild.id);
  let member = await guild.members.get(memberid);
  if (member.user.bot) { return; }


  areaEmbed = message.embeds[0].fields.find(e => e.name.includes(emojiName));
  capsArea = areaEmbed.name.substring(areaEmbed.name.indexOf(emojiName) + 2);
  area = capsArea.charAt(0) + capsArea.substring(1).toLowerCase();

  switch (action) {
    case 'MESSAGE_REACTION_ADD': subscription_create(MAIN, discord, message, member, area); break;
    case 'MESSAGE_REACTION_REMOVE': subscription_remove(MAIN, discord, message, member, area); break;
  }
  return;
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, server, message, member, area) {
  let role = MAIN.Sub_Roles.find(r => r.name.toLowerCase() == area.toLowerCase())
  if (role != null){
    member.addRole(role)
    .then( console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Role] Added role: ' + role.name) )
    .catch( console.error )
  } else {
    MAIN.channels.get(server.command_channels[0]).guild.createRole({
      name: area
    })
    .then(newRole => {
      member.addRole(newRole)
      MAIN.Sub_Roles.set(newRole.id, newRole)
      console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Setup] Created new role: ' + newRole.name);
    })
    .catch(console.error)
  }
  

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    let area_list = ''
    if (!user || !user[0]) {
      user_name = member.user.tag.replace(/[\W]+/g, '');
      MAIN.pdb.query('INSERT INTO users (user_id, user_name, geofence, pokemon, quests, raids, status, bot, alert_time, discord_id, pokemon_status, raids_status, quests_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_name = ?',
        [member.id, user_name, area, , , , 'ACTIVE', 0, '09:00', server.id, 'ACTIVE', 'ACTIVE', 'ACTIVE', user_name], function (error, user, fields) {
          if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
          else {
            let subscription_success = new Discord.RichEmbed().setColor('00ff00')
              .addField(area + ' was successfully added to your areas', '<@' + member.id + '>')
            message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
            console.log("Success!");
            console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] Added ' + member.user.tag + ' to the user table.');
          }
          return;
        });
      return;
    }
    // RETRIEVE AREA NAME FROM USER
    let sub = area;

    // DEFINED VARIABLES
    let areas = user[0].geofence.split(',');
    let area_index = areas.indexOf(sub);
    if (user[0].geofence == 'None') { areas = []; areas.push(sub); }

    // CHECK IF USER IS ALREADY SUBSCRIBED TO THE AREA OR NOT AND ADD
    if (area_index >= 0) { return; }
    else {
      switch (true) {
        case sub == 'all': areas = server.name; break;
        case user[0].geofence == server.name:
        case user[0].geofence == 'None': areas = []; areas.push(sub); break;
        default: areas.push(sub);
      }
    }

    // CONVERT TO STRING
    areas = areas.toString();
    area_list = areas.replace(/,/g,'\n');

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET geofence = ? WHERE user_id = ? AND discord_id = ?`, [areas, member.id, message.guild.id], function (error, user, fields) {
      if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else {
        let subscription_success = new Discord.RichEmbed().setColor('00ff00')
          .addField(area + ' was successfully added to your areas', '<@' + member.id + '>')
          .addField('Your Areas:', '**' + area_list + '**', false)
        message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
        console.log("Success!");
      }
    });
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, discord, message, member, area) {
  let role = MAIN.Sub_Roles.find(r => r.name.toLowerCase() == area.toLowerCase())
  if (role != null){
    member.removeRole(role)
    .then( console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] [Role] Removed role: ' + role.name) )
    .catch( console.error )
  }

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if (!user || !user[0]) { return; }
    // RETRIEVE AREA NAME FROM USER
    let sub = area;
    // DEFINED VARIABLES
    let areas = user[0].geofence.split(',');
    let area_index = areas.indexOf(sub);

    // CHECK IF USER IS ALREADY SUBSCRIBED TO THE AREA OR NOT AND ADD
    if (sub == 'all') { areas = 'None'; }
    else if (area_index < 0) { return; }
    else { areas.splice(area_index, 1); }

    if (areas.length == 0) { areas = 'None'; }
    else { areas = areas.toString(); }
    let area_list = areas.replace(/,/g, '\n');

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET geofence = ? WHERE user_id = ? AND discord_id = ?`, [areas, member.id, message.guild.id], function (error, user, fields) {
      if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else {
        let subscription_success = new Discord.RichEmbed().setColor('00ff00')
          .addField(area + ' was successfully removed from your areas', '<@' + member.id + '>')
          .addField('Your Areas:', '**' + area_list + '**', false)
        message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
        console.log("Success!");
      }
    });
  });
}