const Discord = require('discord.js');
const moment = require('moment-timezone');
const GeoTz = require('geo-tz');

module.exports.run = async (MAIN, action, discord, message, memberid, emojiName) => {

  let guild = await MAIN.guilds.get(message.guild.id);
  let member = await guild.members.get(memberid);
  if (member.user.bot) { return; }

  emojiName = emojiName.replace('_',' ');

  // LOAD DATABASE RECORD
  //MAIN.pdb.query('SELECT * FROM users WHERE user_id = ? AND discord_id = ?', [memberid, discord.id], async function (error, user, fields) {

  // CHECK IF THE USER HAS AN EXISTING RECORD IN THE USER TABLE
  //if(!user || !user[0]){ await MAIN.Save_Sub(message,server); }

  switch (action) {
    case 'MESSAGE_REACTION_ADD': subscription_create(MAIN, discord, message, member, emojiName); break;
    case 'MESSAGE_REACTION_REMOVE': subscription_remove(MAIN, discord, message, member, emojiName); break;
  }

  return;
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, server, message, member, emojiName) {

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if (!user || !user[0]) {
      user_name = member.user.tag.replace(/[\W]+/g, '');
      MAIN.pdb.query('INSERT INTO users (user_id, user_name, geofence, pokemon, quests, raids, status, bot, alert_time, discord_id, pokemon_status, raids_status, quests_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_name = ?',
        [member.id, user_name, server.name, , emojiName, , 'ACTIVE', 0, '09:00', server.id, 'ACTIVE', 'ACTIVE', 'ACTIVE', user_name], function (error, user, fields) {
          if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
          else {
            let subscription_success = new Discord.RichEmbed().setColor('00ff00')
              .addField('Your ' + emojiName + ' Subscription is Complete!', '<@' + member.id + '>'+'\nDelivery Time: 09:00',false)
            message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
            console.log("Success!");
          }
        });
      return;
    }

    // RETRIEVE QUEST NAME FROM USER
    let sub = emojiName

    // DEFINED VARIABLES
    let quests = '';
    if (user[0].quests) {
      quests = user[0].quests.split(',');
    }
    else { quests = []; }

    let index = quests.indexOf(sub);
    let rewards = MAIN.config.QUEST.Rewards.toString().toLowerCase().split(',');
    let reward_index = rewards.indexOf(sub.toLowerCase());

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (index >= 0) { return; }
    else { quests.push(MAIN.config.QUEST.Rewards[reward_index]); }

    // CONVERT ARRAY TO STRING
    quests = quests.toString();
    let alert_time = user[0].alert_time

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET quests = ? WHERE user_id = ? AND discord_id = ?`, [quests, member.id, message.guild.id], function (error, user, fields) {
      if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else {
        let subscription_success = new Discord.RichEmbed().setColor('00ff00')
        .addField('Your ' + emojiName + ' Subscription is Complete!', '<@' + member.id + '>')
        .addField('Your Subscriptions:','**'+quests.replace(/,/g,'\n')+'**'
        +'\nDelivery Time: '+alert_time,false)
        message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
        console.log("Success!");
      }
    });
  }
  );
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, discord, message, member, emojiName) {

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if (!user || !user[0]) { return; }
    // RETRIEVE QUEST NAME FROM USER
    let sub = emojiName

    // DEFINED VARIABLES
    let quests = user[0].quests.split(',');
    let index = quests.indexOf(sub);
    if (index < 0) { return; }
    let rewards = MAIN.config.QUEST.Rewards.toString().toLowerCase().split(',');
    let reward_index = rewards.indexOf(sub.toLowerCase());

    quests.splice(index, 1);


    // CONVERT THE ARRAY TO A STRING
    quests = quests.toString();

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET quests = ? WHERE user_id = ? AND discord_id = ?`, [quests, member.id, message.guild.id], function (error, user, fields) {
      if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else {
        console.log("Success");
      }
    });
  }
  );
}
