const fs = require('fs');
const ini = require('ini');
const path = require('path');
const MySQL = require('mysql');
const Fuzzy = require('fuzzy');
const Discord = require('discord.js');
const InsideGeojson = require('point-in-geopolygon');
const config = ini.parse(fs.readFileSync(path.join(__dirname, '../../config/config.ini'), 'utf-8'));

module.exports.run = async (MAIN, action, discord, message, memberid, emojiName) => {
  let guild = await MAIN.guilds.get(message.guild.id);
  let member = await guild.members.get(memberid);
  if (member.user.bot) { return; }

  switch (action) {
    case 'MESSAGE_REACTION_ADD': subscription_create(MAIN, discord, message, member, emojiName); break;
    case 'MESSAGE_REACTION_REMOVE': subscription_remove(MAIN, discord, message, member, emojiName); break;
  }

  return;
}

async function matchGymName(MAIN, user_choice, discord) {
  return new Promise(function (resolve, reject) {
    // MATCH GYM NAME
    if (user_choice.toLowerCase() == 'all') { user_choice == 'All'; }
    else {
      MAIN.rdmdb.query(`SELECT * FROM gym WHERE name = ?`, [user_choice], async function (error, gyms, fields) {
        if (!gyms) { return; }
        else {
          await gyms.forEach((gym, index) => {
            if (!InsideGeojson.polygon(discord.geofence, [gym.lon, gym.lat])) { gyms.splice(index, 1); }
          });
          if (gyms[0]) {
            return resolve(gyms[0]);
          }
          else { return; }
        }
      });
    }
  });
}


// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, server, message, member, emojiName) {

  // DEFINED THE SUBSCRIPTION OBJECT
  let sub = {}, got_name = false;
  let user_choice = 'All';
  
  sub.gym = 'All';
  sub.areas = 'Yes';
  // RETRIEVE GYM NAME FROM EMOTED MESSAGE
if (message.content.toLowerCase().includes("raidpass") && message.content.toLowerCase().includes("area")){
  //sub.gym = 'All';
  //sub.areas = 'Yes';
} else if (message.content.toLowerCase().includes("raidpass") && message.content.toLowerCase().includes(server.name.toLowerCase())){
  //sub.gym = 'All';
  sub.areas = 'No';
} else {
  user_choice = await matchGymName(MAIN, message.embeds[0].author.name, server);
  sub.id = user_choice.id;
  sub.gym = user_choice.name;
  sub.areas = 'Gym Specified';
}
let areaString = sub.gym
if (sub.areas == 'Yes'){
  areaString = 'your areas'
}
else if(sub.areas == 'No'){
  areaString = 'All of '+server.name
}

  /*if (!message.content.toLowerCase().includes("area")) {
    user_choice = await matchGymName(MAIN, message.embeds[0].author.name, server);
    sub.id = user_choice.id;
    sub.gym = user_choice.name;
    sub.areas = 'Gym Specified';
  }*/

  got_name = true;


  // RETRIEVE BOSS NAME FROM EMOTE
  switch (emojiName) {
    case 'egg_1':
      sub.boss = 'All'
      sub.min_lvl = emojiName.split("_")[1];
      sub.max_lvl = emojiName.split("_")[1];
      break;
    case 'egg_2':
      sub.boss = 'All'
      sub.min_lvl = emojiName.split("_")[1];
      sub.max_lvl = emojiName.split("_")[1];
      break;
    case 'egg_3':
      sub.boss = 'All'
      sub.min_lvl = emojiName.split("_")[1];
      sub.max_lvl = emojiName.split("_")[1];
      break;
    case 'egg_4':
      sub.boss = 'All'
      sub.min_lvl = emojiName.split("_")[1];
      sub.max_lvl = emojiName.split("_")[1];
      break;
    case 'egg_5':
      sub.boss = 'All'
      sub.min_lvl = emojiName.split("_")[1];
      sub.max_lvl = emojiName.split("_")[1];
      break;
    case 'All':
      sub.boss = 'All'
      sub.min_lvl = 'All';
      sub.max_lvl = 'All';
      break;
    default:
      sub.boss = emojiName;
      sub.min_lvl = 'Boss Specified';
      sub.max_lvl = 'Boss Specified';
  }

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if(!user || !user[0]){ 
      let raid = '';
      raid = {};
      raid.subscriptions = [];
      raid.subscriptions.push(sub);
      // STRINGIFY THE OBJECT
      let new_subs = JSON.stringify(raid);
      user_name = member.user.tag.replace(/[\W]+/g, '');
      MAIN.pdb.query('INSERT INTO users (user_id, user_name, geofence, pokemon, quests, raids, status, bot, alert_time, discord_id, pokemon_status, raids_status, quests_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_name = ?',
      [member.id, user_name, server.name, , , new_subs, 'ACTIVE', 0, '09:00', server.id, 'ACTIVE', 'ACTIVE', 'ACTIVE', user_name], function (error, user, fields) {
        if (error) { return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO ADD USER TO users TABLE', error); }
        else {
          let subscription_success = new Discord.RichEmbed().setColor('00ff00')
            .addField('Your '+sub.boss+' Subscription in '+areaString+' is Complete!','<@'+member.id+'>')
          message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
          console.log("Success!");
          console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] Added ' + member.user.tag + ' to the user table.');
        }
          return;
      });
      return;
     }

    let raid = '';
    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (!user[0].raids) {
      raid = {};
      raid.subscriptions = [];
      raid.subscriptions.push(sub);
    } else{ 
      raid = JSON.parse(user[0].raids);
      if (!raid.subscriptions[0]) { raid.subscriptions.push(sub); }
      else {
        // CONVERT TO OBJECT AND CHECK EACH SUBSCRIPTION
        raid = JSON.parse(user[0].raids);
        raid.subscriptions.forEach((subscription, index) => {

          // ADD OR OVERWRITE IF EXISTING
          if (subscription.boss == sub.boss && subscription.gym == sub.gym && subscription.min_lvl == sub.min_lvl && subscription.max_lvl == sub.max_lvl) {

            raid.subscriptions[index] = sub;
            if(sub.areas == 'No' || sub.areas == 'Yes'){
              let searchString = 'RAID BOSS you want to be notified of in: ALL OF'
              let responseString = 'All of '+server.name
              if(sub.areas == 'No'){
                searchString = 'RAID BOSS you want to be notified of in: YOUR'
                responseString = 'your areas'
              }
                message.channel.fetchMessages().then(async messages => {
                  let msg = messages.filter(msg => msg.content.includes(searchString));
                  let refreshedMessage = await message.channel.fetchMessage(msg.first())
                  let emoji = refreshedMessage.reactions.find(reaction => reaction.emoji.name == emojiName)
                  if (emoji){
                    emoji.remove(member).then(() =>{
                      let subscription_change = new Discord.RichEmbed().setColor('FF0000')
                      .addField('Your '+sub.boss+' Subscription in '+responseString+' has been removed ','<@'+member.id+'>')
                    message.channel.send(subscription_change).then(m => m.delete(10000)).catch(console.error);
                    })
                  }
                })
            }
          }
          else if (index == raid.subscriptions.length - 1) { raid.subscriptions.push(sub); }
        });
      }
    }

    // STRINGIFY THE OBJECT
    let new_subs = JSON.stringify(raid);

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET raids = ? WHERE user_id = ? AND discord_id = ?`, [new_subs, member.id, message.guild.id], function (error, user, fields) {
      if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else {
        let subscription_success = new Discord.RichEmbed().setColor('00ff00')
          .addField('Your '+sub.boss+' Subscription in '+areaString+' is Complete!','<@'+member.id+'>')
        message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
        console.log("Success!");
      };
    });
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, server, message, member, emojiName) {

  // FETCH USER FROM THE USERS TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if(!user || !user[0]){ return; }
    // END IF USER HAS NO SUBSCRIPTIONS
    if (!user[0].raids) { return; }
    else {

      // DEFINED THE SUBSCRIPTION OBJECT
      let sub = {}, got_name = false;

      // RETRIEVE GYM NAME FROM EMOTED MESSAGE
      let user_choice = {}
      user_choice.name = 'All';
      if (message.content.toLowerCase().includes("raidpass") && message.content.toLowerCase().includes("area")){
        sub.gym = 'All';
        sub.areas = 'Yes';
      } else if (message.content.toLowerCase().includes("raidpass") && message.content.toLowerCase().includes(server.name.toLowerCase())){
        sub.gym = 'All';
        sub.areas = 'No';
      } else {
        user_choice = await matchGymName(MAIN, message.embeds[0].author.name, server);
        sub.id = user_choice.id;
        sub.gym = user_choice.name;
        sub.areas = 'Gym Specified';
      }


      //sub.id = user_choice.id;
      //sub.gym = user_choice.name;
      got_name = true;

      // RETRIEVE BOSS NAME FROM EMOTE
      switch (emojiName) {
        case 'egg_1':
          sub.boss = 'All'
          sub.min_lvl = emojiName.split("_")[1];
          sub.max_lvl = emojiName.split("_")[1];
          break;
        case 'egg_2':
          sub.boss = 'All'
          sub.min_lvl = emojiName.split("_")[1];
          sub.max_lvl = emojiName.split("_")[1];
          break;
        case 'egg_3':
          sub.boss = 'All'
          sub.min_lvl = emojiName.split("_")[1];
          sub.max_lvl = emojiName.split("_")[1];
          break;
        case 'egg_4':
          sub.boss = 'All'
          sub.min_lvl = emojiName.split("_")[1];
          sub.max_lvl = emojiName.split("_")[1];
          break;
        case 'egg_5':
          sub.boss = 'All'
          sub.min_lvl = emojiName.split("_")[1];
          sub.max_lvl = emojiName.split("_")[1];
          break;
        case 'All':
          sub.boss = 'All'
          sub.min_lvl = 'All';
          sub.max_lvl = 'All';
          break;
        default:
          sub.boss = emojiName;
          sub.min_lvl = 'Boss Specified';
          sub.max_lvl = 'Boss Specified';
      }
      // PARSE THE STRING TO AN OBJECT
      let raids = JSON.parse(user[0].raids), found = false, embed_title = '';

      // FETCH NAME OF POKEMON TO BE REMOVED AND CHECK RETURNED STRING
      let remove_id = raids.subscriptions.findIndex(s => s.gym == sub.gym && s.boss == sub.boss && s.max_lvl == sub.max_lvl && s.min_lvl == sub.min_lvl && s.areas == sub.areas)

      switch (remove_id) {
        case -1: return;

        default:
          // REMOVE THE SUBSCRIPTION
          raids.subscriptions.splice((remove_id), 1);
          embed_title = 'Subscription #' + remove_id + ' Removed!'
      }

      // STRINGIFY THE OBJECT
      let new_subs = JSON.stringify(raids);

      // UPDATE THE USER'S RECORD
      MAIN.pdb.query(`UPDATE users SET raids = ? WHERE user_id = ? AND discord_id = ?`, [new_subs, member.id, message.guild.id], function (error, user, fields) {
        if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else {
          console.log("Success!");
        }
      });
    }
  });
}