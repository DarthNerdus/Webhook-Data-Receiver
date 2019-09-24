delete require.cache[require.resolve('../embeds/pokemon.js')];
const Send_Pokemon = require('../embeds/pokemon.js');
delete require.cache[require.resolve('../embeds/pvp.js')];
const Send_PvP = require('../embeds/pvp.js');
const Discord = require('discord.js');

module.exports.run = async (MAIN, sighting, main_area, sub_area, embed_area, server, timezone) => {

  let internal_value = (sighting.individual_defense+sighting.individual_stamina+sighting.individual_attack)/45;
  let time_now = new Date().getTime(); internal_value = Math.floor(internal_value*1000)/10;

  // FETCH ALL USERS FROM THE USERS TABLE AND CHECK SUBSCRIPTIONS
  MAIN.pdb.query(`SELECT * FROM users WHERE discord_id = ? AND status = ?`, [server.id, 'ACTIVE'], function (error, users, fields){
    if(users && users[0]){
      users.forEach((user,index) => {

	let embed = '';
	if (sighting.cp > 0) { embed = 'pokemon_iv.js'; } else { embed = 'pokemon.js'; }

        //FETCH THE GUILD MEMBER AND CHECK IF A ADMINISTRATOR/DONOR
        let member = MAIN.guilds.get(user.discord_id).members.get(user.user_id), proceed = true;
        switch(true){
          case !member: proceed = false; break;
          case member.hasPermission('ADMINISTRATOR'): proceed = true; break;
          default: if(server.donor_role && !member.roles.has(server.donor_role)){ proceed = false; }
        }

        // DEFINE VARIABLES
        let user_areas = user.geofence.split(',');

        // CHECK IF THE USERS SUBS ARE PAUSED, EXIST, AND THAT THE AREA MATCHES THEIR DISCORD
        if(user.pokemon && user.pokemon_status == 'ACTIVE'){

          // CONVERT POKEMON LIST TO AN ARRAY
          let pokemon = JSON.parse(user.pokemon);

          // CHECK EACH USER SUBSCRIPTION
          pokemon.subscriptions.forEach((sub,index) => {

            // CHECK IF THE AREA IS WITHIN THE USER'S GEOFENCES
            if(sub.areas == 'No' || user.geofence == server.name || user_areas.indexOf(main_area) >= 0 || user_areas.indexOf(sub_area) >= 0){

              // CHECK POKEMON NAME
              if(sub.name == MAIN.masterfile.pokemon[sighting.pokemon_id].name || sub.name.toLowerCase().startsWith('all')){

                // DETERMINE GENDER
                sub.gender = sub.gender.toLowerCase();
                if(sighting.gender == 1){ gender = 'male'; }
                else if(sighting.gender == 2){ gender = 'female'; }
                else{ gender = 'all'; }

                // Determine Size
                size = MAIN.Get_Size(sighting.pokemon_id, sighting.form, sighting.height, sighting.weight);
                if (!sub.size) { sub.size = 'all'; }
                if (sub.size.toLowerCase() == 'all') { size = 'all'; }

                switch(true){
                  case sub.min_iv.length > 3:
                    // SPLIT THE IVs UP INTO INDIVIDUAL STATS
                    let min_iv = sub.min_iv.split('/');
                    let max_iv = sub.max_iv.split('/');

                    // CHECK ALL SUBSCRIPTION REQUIREMENTS
                    switch(true){
                      case sighting.individual_attack < min_iv[0]: break;
                      case sighting.individual_defense < min_iv[1]: break;
                      case sighting.individual_stamina < min_iv[2]: break;
                      case sighting.individual_attack > max_iv[0]: break;
                      case sighting.individual_defense > max_iv[1]: break;
                      case sighting.individual_stamina > max_iv[2]: break;
                      case sub.min_cp > sighting.cp: break;
                      case sub.max_cp < sighting.cp: break;
                      case sub.min_lvl > sighting.pokemon_level: break;
                      case sub.max_lvl < sighting.pokemon_level: break;
                      case sub.size.toLowerCase() != size: break;
                      default:
                        if(sub.gender == 'all' || sub.gender == gender){
                          Send_Pokemon.run(MAIN, true, user, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, '', embed);
                        }
                    } break;
                  default:
                    switch(true){
                      case sub.min_iv > internal_value:  break;
                      case sub.max_iv < internal_value: break;
                      case sub.min_cp > sighting.cp: break;
                      case sub.max_cp < sighting.cp: break;
                      case sub.min_lvl > sighting.pokemon_level: break;
                      case sub.max_lvl < sighting.pokemon_level: break;
                      case sub.size.toLowerCase() != size: break;
                      default:
			// check IVs
			if(sub.min_cp_range && sub.max_cp_range)
      { 
        // no need to calculate possible CP if current CP wasn't provided
        if(!sighting.cp) break;
	if(MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[DEBUG-Subscriptions] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' checking '+user.user_name+'\'s PVP Filters.'); }
        if(sighting.cp > sub.max_cp_range) { if(MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[DEBUG-Subscriptions] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' Did Not Pass '+user.user_name+'\'s Max CP PVP Filters.'); } break; }
        let form_name = '', formID = sighting.form;
        let possible_cps = CalculatePossibleCPs(MAIN, sighting.pokemon_id, sighting.form, sighting.individual_attack, sighting.individual_defense, sighting.individual_stamina, sighting.pokemon_level, gender, sub.min_cp_range, sub.max_cp_range);
        let unique_cps = {};
        
        for(var i = possible_cps.length - 1; i >= 0; i--)
        { 
          if(!unique_cps[possible_cps[i].pokemonID])
          { 
            unique_cps[possible_cps[i].pokemonID] = {};
            
            let pvpRanks = CalculateTopRanks(MAIN, possible_cps[i].pokemonID, possible_cps[i].formID, sub.max_cp_range);
            let rank = pvpRanks[sighting.individual_attack][sighting.individual_defense][sighting.individual_stamina];
            
            
            unique_cps[possible_cps[i].pokemonID].rank = rank.rank;
            unique_cps[possible_cps[i].pokemonID].percent = rank.percent;
            unique_cps[possible_cps[i].pokemonID].level = rank.level;
            unique_cps[possible_cps[i].pokemonID].cp = possible_cps[i].cp;
          }
        }
        
        unique_cps = FilterPossibleCPsByRank(unique_cps, sub.min_pvp_rank);
        unique_cps = FilterPossibleCPsByPercent(unique_cps, sub.min_pvp_percent);
        
        if(Object.keys(unique_cps) == 0) { if(MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[DEBUG-Subscriptions] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' Did Not Pass '+user.user_name+'\'s PVP CPs Filters.'); }break; }

        if(MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[DEBUG-Subscriptions] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' Passed '+user.user_name+'\'s PVP Filters.'); }
        Send_PvP.run(MAIN, user, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, '', 'pvp.js', unique_cps, '')
      
      }
                        if(sub.gender == 'all' || sub.gender == gender){
                          Send_Pokemon.run(MAIN, true, user, sighting, internal_value, time_now, main_area, sub_area, embed_area, server, timezone, '', embed);
                        }
                    }
                }
              } else{
                if(MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[DEBUG-Subscriptions] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' Did Not Pass '+user.user_name+'\'s Name Filters.'); }
              }
            } else{
              if(MAIN.debug.Subscriptions == 'ENABLED'){ console.info('[DEBUG-Subscriptions] [pokemon.js] '+MAIN.masterfile.pokemon[sighting.pokemon_id].name+' Did Not Pass '+user.user_name+'\'s Area Filter.'); }
            }
          });
        }
      });
    }
  });
}

function CalculatePvPStat(MAIN, pokemonID, formID, level, attack, defense, stamina)
{           
    let remainder = level % 1;
    level = Math.floor(level);
    let cpIndex = ((level * 2) - 2) + (remainder * 2);
            
              
    if(!MAIN.masterfile.pokemon[pokemonID].attack){
      attack = (attack + MAIN.masterfile.pokemon[pokemonID].forms[formID].attack) * MAIN.cp_multiplier.CPMultiplier[cpIndex];
      defense = (defense + MAIN.masterfile.pokemon[pokemonID].forms[formID].defense) * MAIN.cp_multiplier.CPMultiplier[cpIndex];
      stamina = (stamina + MAIN.masterfile.pokemon[pokemonID].forms[formID].stamina) * MAIN.cp_multiplier.CPMultiplier[cpIndex];
          
    } else {
      attack = (attack + MAIN.masterfile.pokemon[pokemonID].attack) * MAIN.cp_multiplier.CPMultiplier[cpIndex];
      defense = (defense + MAIN.masterfile.pokemon[pokemonID].defense) * MAIN.cp_multiplier.CPMultiplier[cpIndex];
      stamina = (stamina + MAIN.masterfile.pokemon[pokemonID].stamina) * MAIN.cp_multiplier.CPMultiplier[cpIndex];
    }

    product = attack * defense * Math.floor(stamina);

    product = Math.round(product);
      
    return product;
}

function InitializeBlankPokemon()
{
    let newPokemon = {};

    for(var a = 0; a <= 15; a++)
    {                                                                                                                           
        newPokemon[a] = {};

        for(var d = 0; d <= 15; d++)
        {
            newPokemon[a][d] = {};

            for(var s = 0; s <= 15; s++)
            {       
                newPokemon[a][d][s] = {};
            }         
        }             
    }

    return newPokemon;

}
                      
function PrecisionRound(number, precision)
{
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
}         
        
function FilterPossibleCPsByRank(possibleCPs, minRank = 4096)
{       
  let returnCPs = {};
      
  for(var pokemon in possibleCPs)
  {                   
    if(possibleCPs[pokemon].rank <= minRank)
    {
      returnCPs[pokemon] = possibleCPs[pokemon];
    }                 
  }
  return returnCPs;   
}                     

function FilterPossibleCPsByPercent(possibleCPs, minPercent = 0)
{       
  let returnCPs = {};
        
  for(var pokemon in possibleCPs)
  {     
    if(possibleCPs[pokemon].percent >= minPercent)
    {   
      returnCPs[pokemon] = possibleCPs[pokemon];
    }   
  }
  return returnCPs;
}

function CalculateTopRanks(MAIN, pokemonID, formID, cap)
{
    let currentPokemon = InitializeBlankPokemon();
    let bestStat = {attack: 0, defense: 0, stamina: 0, value: 0};
    let arrayToSort = [];

    for(a = 0; a <= 15; a++)
    {
        for(d = 0; d <= 15; d++)
        {
            for(s = 0; s <= 15; s++)
            {
                let currentStat = CalculateBestPvPStat(MAIN, pokemonID, formID, a, d, s, cap);
                
                if(currentStat > bestStat.value)
                {
                    bestStat = {attack: a, defense: d, stamina: s, value: currentStat.value, level: currentStat.level};
                }   
                
                currentPokemon[a][d][s] = {value: currentStat.value, level: currentStat.level }
                
                arrayToSort.push({attack:a, defense:d, stamina:s, value:currentStat.value});
                
            }
        }   
    }   

    arrayToSort.sort(function(a,b) {
        return b.value - a.value;
    }); 

    let best = arrayToSort[0].value;
    
    for(var i = 0; i < arrayToSort.length; i++)
    {
        let percent = PrecisionRound((arrayToSort[i].value / best) * 100, 2);
        arrayToSort[i].percent = percent;
        currentPokemon[arrayToSort[i].attack][arrayToSort[i].defense][arrayToSort[i].stamina].percent = percent;
        currentPokemon[arrayToSort[i].attack][arrayToSort[i].defense][arrayToSort[i].stamina].rank = i+1;
    }   

    return currentPokemon;
    
}

function CalculateBestPvPStat(MAIN, pokemonID, formID, attack, defense, stamina, cap)
{
    let bestStat = 0;
    let level = 0;
    for(var i = 1; i <= 40; i += .5)
    {
        let CP = CalculateCP(MAIN, pokemonID, formID, attack, defense, stamina, i);
        if(CP <= cap)
        {
            let stat = CalculatePvPStat(MAIN, pokemonID, formID, i, attack, defense, stamina);
            if(stat > bestStat)
            {
                bestStat = stat;
                level = i;
            }   
        }   
        else if(CP > cap)
        {
          i = 41;
        } 
    }   

    return {value: bestStat, level: level};
} 

function sightingFailed(MAIN, filter, reason){
  if(MAIN.debug.Pokemon == 'ENABLED'){ console.info('[DEBUG] [filtering/pokemon.js] Sighting failed '+filter.name+' because of '+reason+' check.'); } return;
}


function CalculatePossibleCPs(MAIN, pokemonID, formID, attack, defense, stamina, level, gender, minCP, maxCP)
{ 
  
  let possibleCPs = [];
  
  // Check for required gender on evolution
  if(MAIN.masterfile.pokemon[pokemonID].gender_requirement  && MAIN.masterfile.pokemon[pokemonID].gender_requirement != gender)
  { 
    return possibleCPs;
  }

  for(var i = level; i <= 40; i += .5)
  {
    let currentCP = CalculateCP(MAIN, pokemonID, formID, attack, defense, stamina, i);
    if(currentCP >= minCP && currentCP <= maxCP)
    { 
      possibleCPs.push({pokemonID:pokemonID, formID: formID, attack:attack, defense:defense, stamina:stamina, level:i, cp:currentCP});
  
    }
    if(currentCP > maxCP) { i = 41; }
  }
  
  // IF no data about possible evolutions just return now rather than moving on
  if(!MAIN.masterfile.pokemon[pokemonID].evolutions){ return possibleCPs; }
  
  for(var i = 0; i < MAIN.masterfile.pokemon[pokemonID].evolutions.length; i++) {
    //Check for Evolution Form
    if (formID > 0){
      if(!MAIN.masterfile.pokemon[pokemonID].forms[formID]){
          evolvedForm = MAIN.masterfile.pokemon[MAIN.masterfile.pokemon[pokemonID].evolutions[i]].default_form;
        } else{
          evolvedForm = MAIN.masterfile.pokemon[pokemonID].forms[formID].evolved_form;
        }
    } else if (MAIN.masterfile.pokemon[pokemonID].evolved_form){
      evolvedForm = MAIN.masterfile.pokemon[pokemonID].evolved_form;
    } else { evolvedForm = formID; }

    possibleCPs = possibleCPs.concat(CalculatePossibleCPs(MAIN,MAIN.masterfile.pokemon[pokemonID].evolutions[i], evolvedForm, attack, defense, stamina, level, gender, minCP, maxCP));
  }
  
  return possibleCPs;
}

function CalculateCP(MAIN, pokemonID, formID, attack , defense, stamina, level)
{       
        let CP = 0;
  let pokemonAttack = 0, pokemonDefense = 0, pokemonStamina = 0;
        let remainder = level % 1;
        level = Math.floor(level);
        
        
        let cpIndex = ((level * 2) - 2) + (remainder * 2);
        let CPMultiplier = MAIN.cp_multiplier.CPMultiplier[cpIndex];

  if(!MAIN.masterfile.pokemon[pokemonID].attack)
  {
    if(!MAIN.masterfile.pokemon[pokemonID].forms[formID] || !MAIN.masterfile.pokemon[pokemonID].forms[formID].attack){
      console.log("Can't find attack of Pokemon ID: "+pokemonID+' Form:'+formID);
    }
    pokemonAttack = MAIN.masterfile.pokemon[pokemonID].forms[formID].attack;
        pokemonDefense = MAIN.masterfile.pokemon[pokemonID].forms[formID].defense;
        pokemonStamina = MAIN.masterfile.pokemon[pokemonID].forms[formID].stamina;
  } else {
    pokemonAttack = MAIN.masterfile.pokemon[pokemonID].attack;
        pokemonDefense = MAIN.masterfile.pokemon[pokemonID].defense;
        pokemonStamina = MAIN.masterfile.pokemon[pokemonID].stamina;
  }     
        
        
        let attackMultiplier = pokemonAttack + parseInt(attack);
        let defenseMultiplier = Math.pow(pokemonDefense + parseInt(defense),.5);
        let staminaMultiplier = Math.pow(pokemonStamina + parseInt(stamina),.5);
        CPMultiplier = Math.pow(CPMultiplier,2);
        
        CP = (attackMultiplier * defenseMultiplier * staminaMultiplier * CPMultiplier) / 10;
        
        CP = Math.floor(CP);
        
        //CP floor is 10
        if(CP < 10)  {CP = 10}
        
        
        return CP;
}
