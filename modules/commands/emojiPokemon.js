const Discord = require('discord.js');

MAX_ALL_SUBS = ['1', '2', '3', '4', '5'];

module.exports.run = async (MAIN, action, discord, message, memberid, emojiName) => {
  let guild = await MAIN.guilds.get(message.guild.id);
  let member = await guild.members.get(memberid);
  if(member.user.bot) {return;}

  switch (action) {
    case 'MESSAGE_REACTION_ADD': subscription_create(MAIN, discord, message, member, emojiName); break;
    case 'MESSAGE_REACTION_REMOVE': subscription_remove(MAIN, discord, message, member, emojiName); break;
  }

  return;
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, server, message, member, emojiName) {

  // DEFINED THE SUBSCRIPTION OBJECT
  let sub = {};
  //let advanced = false;

  // RETRIEVE POKEMON NAME FROM USER
  sub.name = emojiName;
  sub.areas = "Yes";

  //if(sub.name === "100" || sub.name === "96"){advanced = true}
  if (message.content.toLowerCase().includes("ultraball") && message.content.toLowerCase().includes(server.name.toLowerCase())){sub.areas = "No"}

  if (sub.name === "100" || sub.name === "96") {
    sub.name = 'All'
    sub.type = 'advanced';
    sub.min_iv = emojiName;
    sub.max_iv = 100;
    sub.min_cp = 'All';
  }
  else {
    // DEFINE SUB TYPE AND OTHER VARIABLES
    sub.type = 'simple';
    sub.min_iv = 'ALL';
    sub.max_iv = 'ALL';
    sub.min_cp = '1';
  }
  sub.max_cp = 'ALL';
  sub.gender = 'ALL';
  sub.size = 'ALL';
  sub.max_lvl = 'ALL';
  sub.min_lvl = 'ALL';

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if(!user || !user[0]){ 
      let pokemon = '';
      if(!user[0].pokemon){
        if(sub.name == 'All'){ sub.name == 'All-1'; }
        pokemon = {};
        pokemon.subscriptions = [];
        pokemon.subscriptions.push(sub);
      }
      else{
        pokemon = JSON.parse(user[0].pokemon);
        if(!pokemon.subscriptions[0]){
          if(sub.name == 'All'){ sub.name = 'All-1'; }
          pokemon.subscriptions.push(sub);
        }
        else if(sub.name == 'All'){
          let s = 1;
          await MAX_ALL_SUBS.forEach((max_num,index) => {
            pokemon.subscriptions.forEach((subscription,index) => {
              let sub_name = sub.name+'-'+max_num;
              if(sub_name == subscription.name){ s++; }
            });
          });
  
          // RENAME ALL SUB AND PUSH TO ARRAY
          sub.name = sub.name+'-'+s.toString();
          pokemon.subscriptions.push(sub);
        }
        else{
          // CONVERT TO OBJECT AND CHECK EACH SUBSCRIPTION
          pokemon = JSON.parse(user[0].pokemon);
          pokemon.subscriptions.forEach((subscription,index) => {
  
            // ADD OR OVERWRITE IF EXISTING
            if(subscription.name == sub.name){
              pokemon.subscriptions[index] = sub;
            }
            else if(index == pokemon.subscriptions.length-1){ pokemon.subscriptions.push(sub); }
          });
        }
      }
      // STRINGIFY THE OBJECT
      let newSubs = JSON.stringify(pokemon);
      user_name = member.user.tag.replace(/[\W]+/g, '');
      MAIN.pdb.query('INSERT INTO users (user_id, user_name, geofence, pokemon, quests, raids, status, bot, alert_time, discord_id, pokemon_status, raids_status, quests_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_name = ?',
      [member.id, user_name, server.name, newSubs, , , 'ACTIVE', 0, '09:00', server.id, 'ACTIVE', 'ACTIVE', 'ACTIVE', user_name], function (error, user, fields) {
        if (error) { return console.error('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] UNABLE TO ADD USER TO users TABLE', error); }
        else {
          let subscription_success = new Discord.RichEmbed().setColor('00ff00')
            .addField('Your '+sub.name+' Subscription in '+areaString+' is Complete!','<@'+member.id+'>')
          message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
          console.log('[Pokébot] [' + MAIN.Bot_Time(null, 'stamp') + '] Added ' + member.user.tag + ' to the user table.');
        }  
          return;
      });
      return;
     }
     let areaString = 'All of '+server.name
     if (sub.areas == 'Yes'){areaString = 'your areas'}
    let pokemon = '';
    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (!user[0].pokemon) {
      if (sub.name == 'All') { sub.name == 'All-1'; }
      pokemon = {};
      pokemon.subscriptions = [];
      pokemon.subscriptions.push(sub);
    }
    else {
      pokemon = JSON.parse(user[0].pokemon);
      if (!pokemon.subscriptions[0]) {
        if (sub.name == 'All') { sub.name = 'All-1'; }
        pokemon.subscriptions.push(sub);
      }
      else if (sub.name == 'All') {
        let s = 1;
        await MAX_ALL_SUBS.forEach((max_num, index) => {
          pokemon.subscriptions.forEach((subscription, index) => {
            let sub_name = sub.name + '-' + max_num;
            if (sub_name == subscription.name) { s++; }
          });
        });

        // RENAME ALL SUB AND PUSH TO ARRAY
        sub.name = sub.name + '-' + s.toString();
        pokemon.subscriptions.push(sub);
      }
      else {
        // CONVERT TO OBJECT AND CHECK EACH SUBSCRIPTION
        pokemon = JSON.parse(user[0].pokemon);
        pokemon.subscriptions.forEach((subscription, index) => {

          // ADD OR OVERWRITE IF EXISTING
          if (subscription.name == sub.name) {
            pokemon.subscriptions[index] = sub;
            let searchString = 'WILD POKEMON you want to be notified of in: ALL OF'
            let responseString = 'All of '+server.name
            if(sub.areas == 'No'){
              searchString = 'WILD POKEMON you want to be notified of in: YOUR'
              responseString = 'your areas'
            }
              message.channel.fetchMessages().then(async messages => {
                let msg = messages.filter(msg => msg.content.includes(searchString));
                let refreshedMessage = await message.channel.fetchMessage(msg.first())
                let emoji = refreshedMessage.reactions.find(reaction => reaction.emoji.name == emojiName)
                if (emoji){
                  emoji.remove(member).then(() =>{
                    let subscription_change = new Discord.RichEmbed().setColor('FF0000')
                    .addField('Your '+sub.name+' Subscription in '+responseString+' has been removed ','<@'+member.id+'>')
                  message.channel.send(subscription_change).then(m => m.delete(10000)).catch(console.error);
                  })
                }
              })
            
          }
          else if (index == pokemon.subscriptions.length - 1) { pokemon.subscriptions.push(sub); }
        });
      }
    }

    // STRINGIFY THE OBJECT
    let newSubs = JSON.stringify(pokemon);


    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET pokemon = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, member.id, message.guild.id], function (error, user, fields) {
      if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else {
        let subscription_success = new Discord.RichEmbed().setColor('00ff00')
          .addField('Your '+sub.name+' Subscription in '+areaString+' is Complete!','<@'+member.id+'>')
        message.channel.send(subscription_success).then(m => m.delete(10000)).catch(console.error);
      }
    });
  });
}





// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, server, message, member, emojiName) {

  // FETCH USER FROM THE USERS TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if(!user || !user[0]){ return; }
    // PARSE THE STRING TO AN OBJECT
    let pokemon = JSON.parse(user[0].pokemon), found = false;

    // FETCH NAME OF POKEMON TO BE REMOVED AND CHECK RETURNED STRING
    let remove_name = emojiName;
    let remove_area = 'Yes';
    if (message.content.toLowerCase().includes("ultraball") && message.content.toLowerCase().includes(server.name.toLowerCase())){remove_area = "No"}


    // CHECK THE USERS RECORD FOR THE SUBSCRIPTION
    pokemon.subscriptions.forEach((subscription, index) => {
      if (subscription.name.toLowerCase() == remove_name.toLowerCase()
      && subscription.areas == remove_area) {
        found = true;

        // REMOVE THE SUBSCRIPTION
        pokemon.subscriptions.splice(index, 1);
      }
    });

    // RETURN NOT FOUND
    if (found == false) {return;}

    // STRINGIFY THE OBJECT
    let newSubs = JSON.stringify(pokemon);

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET pokemon = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, member.id, message.guild.id], function (error, user, fields) {
      if (error) { return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
    });
  });
}