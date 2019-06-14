const Discord = require('discord.js');
const pvp = require('../base/pvp.js');

module.exports.run = async (MAIN, message, pokemon_id, form_id, server) => {
      // CHECK IF THE TARGET IS A USER
      let member = MAIN.guilds.get(server.id).members.get(message.author.id);
      let guild = MAIN.guilds.get(message.guild.id);
      let role_id = '';

      // DETERMINE POKEMON NAME
      let pokemon_name = MAIN.masterfile.pokemon[pokemon_id].name;
      let pokemon_type = '', weaknesses = '', pokemon_color = '', evolutions = pokemon_name;
      let attack = '', defense = '', stamina = '', form_name = '';
      let height = '', weight = '';
      let candy = MAIN.masterfile.pokemon[pokemon_id].candy;
      let buddy = MAIN.masterfile.pokemon[pokemon_id].buddy_distance;
      let thirdmove = MAIN.masterfile.pokemon[pokemon_id].thirdmove;
      let catch_rate = Math.round(MAIN.masterfile.pokemon[pokemon_id].catch_rate * 100);
      let flee = Math.round(MAIN.masterfile.pokemon[pokemon_id].flee_rate * 100);
      let male = Math.round(MAIN.masterfile.pokemon[pokemon_id].male_percent * 100);
      let female = Math.round(MAIN.masterfile.pokemon[pokemon_id].female_percent * 100);

      if(!form_id || form_id == 'NaN'){
        if(MAIN.masterfile.pokemon[pokemon_id].default_form){
          form_id = MAIN.masterfile.pokemon[pokemon_id].default_form;
        } else { form_id = 0; }
      }

      // DETERMINE FORM TYPE(S), EMOTE AND COLOR
      if (!MAIN.masterfile.pokemon[pokemon_id].attack) {
        form_name = ' ['+MAIN.masterfile.pokemon[pokemon_id].forms[form_id].name+']';
        attack = MAIN.masterfile.pokemon[pokemon_id].forms[form_id].attack;
        defense = MAIN.masterfile.pokemon[pokemon_id].forms[form_id].defense;
        stamina = MAIN.masterfile.pokemon[pokemon_id].forms[form_id].stamina;
        height = Math.floor(MAIN.masterfile.pokemon[pokemon_id].forms[form_id].height*100)/100;
        weight = Math.floor(MAIN.masterfile.pokemon[pokemon_id].forms[form_id].weight*100)/100;

        MAIN.masterfile.pokemon[pokemon_id].forms[form_id].types.forEach((type) => {
          pokemon_type += MAIN.emotes[type.toLowerCase()]+' '+type+' / ';
          MAIN.types[type.toLowerCase()].weaknesses.forEach((weakness,index) => {
            if(weaknesses.indexOf(MAIN.emotes[weakness.toLowerCase()]) < 0){
              weaknesses += MAIN.emotes[weakness.toLowerCase()]+' ';
            }
          });
          pokemon_color = MAIN.Get_Color(type, pokemon_color);
        });
        pokemon_type = pokemon_type.slice(0,-3);
        weaknesses = weaknesses.slice(0,-1);
      } else {
        attack = MAIN.masterfile.pokemon[pokemon_id].attack;
        defense = MAIN.masterfile.pokemon[pokemon_id].defense;
        stamina = MAIN.masterfile.pokemon[pokemon_id].stamina;
        height = Math.floor(MAIN.masterfile.pokemon[pokemon_id].height*100)/100;
        weight = Math.floor(MAIN.masterfile.pokemon[pokemon_id].weight*100)/100;

        MAIN.masterfile.pokemon[pokemon_id].types.forEach((type) => {
          pokemon_type += MAIN.emotes[type.toLowerCase()]+' '+type+' / ';
          MAIN.types[type.toLowerCase()].weaknesses.forEach((weakness,index) => {
            if(weaknesses.indexOf(MAIN.emotes[weakness.toLowerCase()]) < 0){
              weaknesses += MAIN.emotes[weakness.toLowerCase()]+' ';
            }
          });
          pokemon_color = MAIN.Get_Color(type, pokemon_color);
        });
        pokemon_type = pokemon_type.slice(0,-3);
        weaknesses = weaknesses.slice(0,-1);
      }

      //EVOLUTION FAMILY
      for (key in MAIN.masterfile.pokemon) { //Find Previous Evolutions
        for(var i = 0; i < MAIN.masterfile.pokemon[key].evolutions.length; i++) {
          if (MAIN.masterfile.pokemon[key].evolutions[i] == pokemon_id) {
            evolutions = MAIN.masterfile.pokemon[key].name+' -> '+evolutions;
            evolve = key;
            for (key in MAIN.masterfile.pokemon) {
              for(var x = 0; x < MAIN.masterfile.pokemon[evolve].evolutions.length; x++) {
               if (MAIN.masterfile.pokemon[key].evolutions[x] == evolve) {
                 evolutions = MAIN.masterfile.pokemon[key].name+' -> '+evolutions;
                 break;
               }
             }
           }
           break;
          }
        }
       }
       if (MAIN.masterfile.pokemon[pokemon_id].evolutions){ //Find Next Evolution
         evolutions += ' -> ';
         for(var i = 0; i < MAIN.masterfile.pokemon[pokemon_id].evolutions.length; i++) {
           evolutions += MAIN.masterfile.pokemon[MAIN.masterfile.pokemon[pokemon_id].evolutions[i]].name+', ';
           evolve = parseInt(MAIN.masterfile.pokemon[pokemon_id].evolutions[i]);
           if (evolve != 'NaN' && MAIN.masterfile.pokemon[evolve]) {
             evolutions = evolutions.slice(0,-2);
             evolutions += ' -> ';
             for(var x = 0; x < MAIN.masterfile.pokemon[evolve].evolutions.length; x++) {
               evolutions += MAIN.masterfile.pokemon[MAIN.masterfile.pokemon[evolve].evolutions[x]].name+', ';
             }
           }
         }
         evolutions = evolutions.slice(0,-2);
       }



      // GET SPRITE IMAGE
      let sprite = await MAIN.Get_Sprite(form_id, pokemon_id);

      let dex_embed = new Discord.RichEmbed()
      .setColor(pokemon_color)
      .setThumbnail(sprite)
      .setTitle('**'+pokemon_name+'**'+form_name+' ('+pokemon_id+') '+pokemon_type)
      .setDescription(MAIN.masterfile.pokemon[pokemon_id].dex)
      .addField('__Evolution Family__', evolutions)
      .addField('__Weaknesses__',weaknesses,true)
      .addField('__Catch & Flee Rate__','**Catch**: '+catch_rate+'% **Flee**: '+flee+'%',true)
      .addField('__Size & Gender__',
                '**Height**: '+height+'m **Weight**: '+weight+'kg\n'
               +'**Male**: '+male+'% **Female**: '+female+'%',true)
      .addField('__Base Stats__',
                '**Atk**: '+attack
             +', **Def**: '+defense
             +', **Sta**: '+stamina,true)
      .addField('__Max CPs__',
                '**Level 40**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,40)
               +' | **Level 25**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,25)
               +'\n**Level 20**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,20)
               +' | **Level 15**: '+pvp.CalculateCP(MAIN,pokemon_id,form_id,15,15,15,15));

      if(server.spam_channels.indexOf(message.channel.id) >= 0){
        return MAIN.Send_Embed('dex', 0, server, role_id, dex_embed, message.channel.id);
      } else {
        guild.fetchMember(message.author.id).then( TARGET => {
          return TARGET.send(dex_embed).catch(console.error);
        });
      }

      async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      }
}
