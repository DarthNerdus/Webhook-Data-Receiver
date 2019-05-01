const discord = require('discord.js');
const oauth2 = require('./modules/oauth2.js');
const stripe = require('./modules/stripe.js');
const database = require('./modules/database.js');
var cookieSession = require('cookie-session')
const bot = require('./modules/bot.js');
const bodyParser = require('body-parser');
const express = require('express');
const moment = require('moment');
const ini = require('ini');
const fs = require('fs');

// LOAD CONFIGS
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

const server = express();
server.use(express.static(__dirname + '/'));
server.use(bodyParser.urlencoded({extend:true}));
server.engine('html', require('ejs').renderFile);
server.set('view engine', 'html');
server.set('views', __dirname);

function getTime(type){
  switch(type){
    case 'footer': return moment().format('dddd, MMMM Do, h:mm A');
    case 'stamp': return moment().format('HH:mmA');
  }
}

server.use(cookieSession({
  name: 'session',
  keys: ['P4^$535@6cy%OwjSq2^992Z@E!w#36wUoxpSj1SnWCfy&aNt1t'],
  maxAge: 518400000,
}))

server.get('/login', async (req,res) => {

  console.log('/login', req.session);

  // IF NO COOKIE PARAMETERS SEND TO COOKIE.HTML
  if(req.query.code){

      // GET CURRENT TIME
      let time_now = moment().unix();

      // GRAB ACCESS TOKEN
      let token = await oauth2.fetchAccessToken(req.query.code);

      // FETCH THE USER IF NOT IN DATABASE
      let user = await oauth2.fetchUser(token);

      if(!user){ return console.error('[start.js] Failed to fetch User'); }

      // FETCH A LIST OF THE USER'S GUILDS
      let guilds = await oauth2.fetchUserGuilds(token);

      // JOIN THE USER TO THE DISCORD IF NOT ALREADY A MEMBER
      await oauth2.joinGuild(bot, token, config.guild_id, user.id);

      req.session.user_id = user.id;

      res.redirect(`/login`);

  }
  else if(!req.session.user_id){
    console.info('[OAUTH2-STRIPE] ['+getTime('stamp')+'] No cookie found. Sending user to Discord Oauth.');
    return res.redirect(oauth2.base_url+`oauth2/authorize?response_type=code&client_id=${oauth2.client_id}&scope=${oauth2.scope}&redirect_uri=${oauth2.redirect}`);
  }

  // CHECK IF USER ID IS VALID
  else{
    bot.fetchUser(req.session.user_id).then((user) => {
      if(!user){
        console.info('[OAUTH2-STRIPE] ['+getTime('stamp')+'] Received an Invalid User ID. Sending to Discord Oauth.');
        return res.redirect(oauth2.base_url+`oauth2/authorize?response_type=code&client_id=${oauth2.client_id}&scope=${oauth2.scope}&redirect_uri=${oauth2.redirect}`);
      }
      else{

        // CHECK IF USER IS A DISCORD MEMBER
        let member = bot.guilds.get(config.guild_id).members.get(req.query.id);
        if(member){

          // SEND TO MAP IF A DONOR
          if(member.roles.has(config.donor_role_id)){
            console.info('[OAUTH2-STRIPE] ['+getTime('stamp')+'] '+user.tag+' logged into '+config.map_name+'.');
            return res.redirect();
          }

          // SEND TO SUSBCRIPTION PAGE IF NOT A DONOR
          else{
            console.info('[OAUTH2-STRIPE] ['+getTime('stamp')+'] Sending '+user.tag+' to '+config.map_name+' subscription page.');
            return res.redirect(config.map_url+'/subscribe'); }
        }

        // JOIN TO GUILD IF NOT A MEMBER
        else{
          return oauth2.joinGuild(bot, token.access_token, config.guild_id, user.id);
        }
      }

      // SEND TO MAP

    });
  }
});

server.get('/login', async (req,res) => {

  // IF STRIPE PLAN IS NULL THEN SEND TO DONO PAGE
  // let donor = await database.check(user.id);
  // switch(true){
  //   case !stripe: break;
  //   case donor.stripe_plan == 'BANNED': break;
  //   case donor.stripe_plan == 'N/A': break;
  //   default:
  //     res.redirect('/'+stripe.city);
  // }
    // mysql.query('SELECT * FROM '+MAIN.config.DB.pokebot_db_name+'.oauth2_stripe WHERE user_id = ?', [user.id, target_guild], function (error, record, fields){
    //   if(error){ return console.error; }
    //   bot.fetchUser(user.id).then((user) => {
    //     if(!record[0]){
    //       mysql.query('INSERT INTO '+MAIN.config.DB.pokebot_db_name+'.oauth2_stripe (user_id, user_name, users_guilds, stripe_plan, stripe_id, oauth2_token, token.expiration) VALUES (?, ?, ?, ?, ?, ?)', [user.id, user.name, guilds.toString(), , token.access_token, token_expiration], function (error, user, fields) {
    //         if(error){ return console.error; }
    //         else{ console.log('[Oauth2] User Inserted.'); }
    //       });
    //     } else{
    //       let user_guilds = user[0].guilds.split(',');
    //       if(user_guilds != guilds){
    //         guilds.forEach((guild,index) => {
    //           if(user.guilds.indexOf(guild) < 0){ new_guilds += guilds+'\n'}
    //         });
    //         query = 'UPDATE '+MAIN.config.DB.pokebot_db_name+'.oauth2_stripe SET user_guilds = ? WHERE user_id = ?';
    //         mysql.query( query, [user_guilds, user.id, target_guild], function (error, user, fields) {
    //           if(error){ return console.error; }
    //           else{ console.log('[Oauth2] Updated user_guilds for '); }
    //         });
    //
    //       }
    //     }
    //   });
    // });
});

server.get('/stripe', async (req,res) => {
  console.info('[OAUTH2-STRIPE] ['+getTime('stamp')+'] Received a Stripe Webhook.');
});

server.get('/subscribe', function(req, res){
    res.render('/templates/subscribe.html',{email:data.email,password:data.password});
});

server.listen(config.listening_port, () => {
  console.info('[OAUTH2-STRIPE] ['+getTime('stamp')+'] Now Listening on port '+config.listening_port+'.');
});

// console.log('GRABBING STRIPE')
// stripe.customerList(database);

module.exports = server;
