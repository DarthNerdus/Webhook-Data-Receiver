const fs = require('fs');
const ini = require('ini');
const axios = require('axios');
const Discord = require('discord.js');
const oauth = require("discord-oauth2");
const bot = require('./bot.js');
const btoa = require('btoa');
const fetch = require('node-fetch');
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// SCRIPT VARIABLES
var oauth2 = {
  "client_id": config.OAUTH2.client_id,
  "client_secret": config.OAUTH2.client_secret,
  "redirect": config.OAUTH2.redirect,
  "base_url": `https://discordapp.com/api/`,
  "scope": config.OAUTH2.scope.replace(/,/g, '%20')
};

const creds = btoa(`${oauth2.client_id}:${oauth2.client_secret}`);

// FETCH ACCESS TOKEN FROM DISCORD
oauth2.fetchAccessToken = (code) => {
  return new Promise(async function(resolve) {
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${oauth2.redirect}`, { method: 'POST', headers: { Authorization: `Basic ${creds}` } });
    const json = await response.json();
    return resolve(json.access_token);
    // axios.post(oauth2.base_url+`oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${oauth2.redirect}`, {
    //   headers: { Authorization: `Basic ${creds}` },
    // }).then(function(response) { console.log(response.data);
    // }).catch( error => { console.error(error); return resolve(error); });
  });
}

// FETCH DISCORD USER WITH ACCESS TOKEN
oauth2.fetchUser = (access_token) => {
  console.log('[oauth.js] Now fetch User with access_token '+access_token);
  return new Promise(async function(resolve) {
    axios.get(oauth2.base_url+`v6/users/@me`, {
      headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/x-www-form-urlencoded" }
    }).then(function(response) { return resolve(response.data);
    }).catch( error => { console.error; return resolve(error); });
  });
}

// FETCH DISCORD USER'S GUILDS WITH ACCESS TOKEN
oauth2.fetchUserGuilds = (access_token) => {
  return new Promise(function(resolve) {
    axios.get(oauth2.base_url+`v6/users/@me/guilds`, {
      headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/x-www-form-urlencoded" }
    }).then(async function(response) {
      let guilds = [];
      await response.data.forEach((server,index) => { guilds.push(server.id); });
      return resolve(guilds);
    }).catch( error => { console.error(error); return resolve(error); });
  });
}

// JOIN THE USER TO A DISCORD GUILD
oauth2.joinGuild = (bot, access_token, guild_id, user_id) => {
  bot.fetchUser(user_id).then(async (user) => {
    let options = { 'accessToken': access_token }
    let guild = await bot.guilds.get(guild_id);
    if(guild){ guild.addMember(user, options); }
    return 'success';
  });
}

// NEW USER CHECK
oauth2.newUser = (bot, guild_id) => {

}

// USER GUILDS CHECK
oauth2.userGuildsCheck = async (bot, record) => {

  // GET CITY GUILD ID
  let guild_id = config.guild_id;

  // FETCH A LIST OF THE USER'S GUILDS
  let guilds = await oauth2.fetchUserGuilds(record.access_token);

  // JOIN THE USER TO THE DISCORD IF NOT ALREADY A MEMBER
  if(guilds.indexOf(guild_id) < 0){
    await oauth2.joinGuild(token.access_token, target_guild, user.id);
  }

  // CONVERT USER GUILD LIST TO AN ARRAY
  user_guilds = record.user_guilds.split(',');

  // CHECK FOR NEW GUILDS
  let new_guilds = '';
  guilds.forEach((guild,index) => {
    if(user_guilds.indexOf(guild) < 0){ new_guilds += guild+'\n'; }
  });

  // IF NEW GUILDS ARE FOUND, UPDATE RECORDS
  if(new_guilds){

    // REMOVE THE LAST LINE BREAK
    new_guilds.slice(0,-3);

    // FETCH THE MEMBER OBJECT
    let member = bot.guilds.get(guild_id).memebers.get(record.id);

    // FETCH MEMBER NICKNAME
    if(member.nickname){ user_name = member.nickname; } else{ user_name = member.user.username; }

    // UPDATE DB RECORD FOR USER


    // DATABASE QUERY FUNCTION HERE


    // SEND NEW GUILDS TO DISCORD
    let guilds_embed = new Discord.RichEmbed()
      .setColor('#FFA533')
      .setAuthor(user_name+' ('+user.id+')', member.user.displayAvatarURL)
      .setTitle('User joined new guilds!')
      .setDescription('```'+new_guilds+'```')
      .setFooter(server.getTime('footer'));
    bot.channels.get(config.user_info_channel).send(guilds_embed).catch(console.error);
  }
}

// USER ACCESS TOKEN REFRESH
oauth2.userRefresh = (bot, record) => {

}

// USER DONOR CHECK
oauth2.userDonorCheck = (bot, record) => {

  // GET CITY GUILD ID
  let guild_id = config.guild_id;

  // FETCH THE GUILD MEMBER
  let member = bot.guilds.get(guild_id).memebers.get(record.id);

  // CHECK FOR THE DONOR ROLE
  if(member.roles.find('name',config.donor_role_name)){ return true; }
  else{ return false; }
}

// EXPORT OAUTH2
module.exports = oauth2;
