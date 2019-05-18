const moment = require('moment-timezone');
const Discord = require('discord.js');
const ini = require('ini');
const fs = require('fs');

// EVENTS TO DISABLE TO SAVE MEMORY AND CPU
var eventsToDisable = ['channelCreate','channelDelete','channelPinsUpdate','channelUpdate','clientUserGuildSettingsUpdate',
  'clientUserSettingsUpdate','debug','disconnect','emojiCreate','emojiDelete','emojiUpdate','guildCreate','guildDelete',
  'guildMemberAvailable','guildMembersChunk','guildMemberSpeaking','guildMemberUpdate','guildUnavailable','guildUpdate',
  'messageDelete','messageDeleteBulk','messageReactionRemoveAll','messageUpdate','presenceUpdate','reconnecting','resume',
  'roleCreate','roleDelete','roleUpdate','typingStart','typingStop','userNoteUpdate','userUpdate','voiceStateUpdate','warn'];

// DEFINE BOTS AND DISABLE ALL EVENTS TO SAVE MEMORY AND CPU
const bot = new Discord.Client({ disabledEvents: eventsToDisable });

// INITIAL LOAD OF CONFIG AND DISCORDS
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// CONFIRM BOT IS ONLINE AND SET STATUS
bot.on('ready', () => {
  console.log('[OAUTH2-STRIPE] [bot.js] ['+moment().format('HH:mmA')+'] The bot ('+bot.user.tag+') is started.');
  return bot.user.setActivity(config.map_name, { type: 'WATCHING' });
});

// LOGIN THE BOT
console.log('[OAUTH2-STRIPE] [bot.js] ['+moment().format('HH:mmA')+'] Starting up the bot...');
bot.login(config.OAUTH2.bot_token);

// EXPORT OAUTH2
module.exports = bot;
