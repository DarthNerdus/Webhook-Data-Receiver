const Discord = require('discord.js');
const insideGeofence = require('point-in-polygon');
const insideGeojson = require('point-in-geopolygon');

module.exports.run = async (MAIN, action, discord, message, memberid, emojiName) => {
  let guild = await MAIN.guilds.get(message.guild.id);
  let member = await guild.members.get(memberid);
  if(member.user.bot) {return;}

  
  areaEmbed = message.embeds[0].fields.find(e => e.name.includes(emojiName));
  capsArea = areaEmbed.name.substring(areaEmbed.name.indexOf(emojiName)+2);
  area = capsArea.charAt(0) + capsArea.substring(1).toLowerCase();

  switch (action) {
    case 'MESSAGE_REACTION_ADD': subscription_create(MAIN, discord, message, member, area); break;
    case 'MESSAGE_REACTION_REMOVE': subscription_remove(MAIN, discord, message, member, area); break;
  }
  return;
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, server, message, member, area){

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {
    if(!user || !user[0]){ await MAIN.Save_Emoji_Sub(member, server, message.guild); }
    // RETRIEVE AREA NAME FROM USER
    let sub = area;

    // DEFINED VARIABLES
    let areas = user[0].geofence.split(',');
    let area_index = areas.indexOf(sub);
    if(user[0].geofence == 'None') {areas = []; areas.push(sub);}

    // CHECK IF USER IS ALREADY SUBSCRIBED TO THE AREA OR NOT AND ADD
    if(area_index >= 0){ return;}
    else{
      switch(true){
        case sub == 'all': areas = server.name; break;
        case user[0].geofence == server.name:
        case user[0].geofence == 'None': areas = []; areas.push(sub); break;
        default: areas.push(sub);
      }
    }

    // CONVERT TO STRING
    areas = areas.toString();

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET geofence = ? WHERE user_id = ? AND discord_id = ?`, [areas, member.id, message.guild.id], function (error, user, fields) {
      if(error){ return; }
    });
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, discord, message, member, area){

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, message.guild.id], async function (error, user, fields) {

    // RETRIEVE AREA NAME FROM USER
    let sub = area;
    // DEFINED VARIABLES
    let areas = user[0].geofence.split(',');
    let area_index = areas.indexOf(sub);

    // CHECK IF USER IS ALREADY SUBSCRIBED TO THE AREA OR NOT AND ADD
    if(sub == 'all'){ areas = 'None'; }
    else if(area_index < 0){ return; }
    else{ areas.splice(area_index,1); }

    if(areas.length == 0){ areas = 'None'; }
    else{ areas = areas.toString(); }

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET geofence = ? WHERE user_id = ? AND discord_id = ?`, [areas, member.id, message.guild.id], function (error, user, fields) {
      if(error){ return;}
    });
  });
}