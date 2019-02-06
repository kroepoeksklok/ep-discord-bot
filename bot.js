const Discord = require('discord.js');
const config = require('./config');
const createLogger = require('logging');

class Bot {
  constructor() {
    const bot = new Discord.Client({
      autoReconnect: true
    });

    const logger = require('logging');

    this.sendMessage = (channel, message) => {
      logger.info(`Sending message: ${message}`);
      channel.send( message );
    };

    bot.on('ready', function () {
      logger.info(`Logged in as ${client.user.tag}!`);

      const guildsToSendHelloPhraseTo = config.guildsToSendHelloPhraseTo.split(',');
      const channelsToSendHelloPhraseTo = config.channelsToSendHelloPhraseTo.split(',');

      bot.guilds.forEach(guild => {
        if(guildsToSendHelloPhraseTo.find( g => guild.name === g)) {
          guild.channels.forEach(channel => {
            if( channelsToSendHelloPhraseTo.find(c => channel.name === c)) {
              channel.send(config.helloMessage);
            }
          });
        }
      });
    });

    bot.client.on('message', msg => {
      msg.reply(`${output}`);

      if (msg.content === 'ping') {
        msg.reply('pong');
      }

      if(message.content === '!nextwar') {
        const timeUntilNextWar = Events.untilNextWar(moment.utc());
        const numDays = timeUntilNextWar.days();
        const numHours = timeUntilNextWar.hours();
        const numMinutes = timeUntilNextWar.minutes();
        const numSeconds = timeUntilNextWar.seconds();

        let output = 'The next war starts in ';
        if (numDays > 0) {
          output = output.concat(`${numDays} days, ${numHours} hours, ${numMinutes} minutes and ${numSeconds} seconds.`);
        } else {
          if (numHours > 0) {
            output = output.concat(`${numHours} hours, ${numMinutes} minutes and ${numSeconds} seconds.`);
          } else {
            if (numMinutes > 0) {
              output = output.concat(`${numMinutes} minutes and ${numSeconds} seconds.`);
            } else {
              output = output.concat(`${numSeconds} seconds.`);
            }
          }
        }

        msg.reply(`${output}`);
      }
    });
  }
}

module.exports = Bot;
// const Discord = require('discord.js');
// const moment = require('moment');
// const fs = require('fs');
// const createLogger = require('logging');

// const Jokes = require('./Jokes.js');
// const Events = require('./events.js');

// const logger = createLogger.default('Bot');
// const client = new Discord.Client();

// let warData = {};

// function ShouldInformThatWarWillBegin(timeUntilNextWar) {
//   return timeUntilNextWar.hours() <= 1 && !warData.announcedWar;
// }

// function InformEveryoneThatWarWillBeginSoon() {
//   logger.info('Informing everyone that war will begin soon');
// }

// function writeWarDataToFile() {
//   fs.writeFile('file', JSON.stringify(warData), function(err) {
//     if(err){
//       logger.error(err);
//     }
//     logger.info('War data saved');
//   });
// }

// function setWarData(announcedWar, nextWarMoment) {
//   if(!nextWarMoment)  warData.nextWar = nextWarMoment;
//   warData.announcedWar = announcedWar;
// }

// client.on('ready', () => {
//   logger.info(`Logged in as ${client.user.tag}!`);

//   //const today = moment.utc();
//   const today = moment.utc('2019-02-06T10:15:00'); 
  
//   warData = JSON.parse(fs.readFileSync('file', 'utf8'));
//   // logger.info(`${warData.nextWar}`);
//   // logger.info(`${warData.announcedWar}`);

//   //const nextWarDate = Events.nextWarDate(moment.utc());
//   const nextWarDate = Events.nextWarDate(today);
//   const storedWarDate = moment.utc(warData.nextWar);

//   logger.info(`nextWarDate = ${nextWarDate}`);
//   logger.info(`storedWarDate = ${storedWarDate}`);

//   if(nextWarDate.isSame(storedWarDate)) {
//     //const timeUntilNextWar = Events.untilNextWar(moment.utc());
//     const timeUntilNextWar = Events.untilNextWar(today);

//     if(ShouldInformThatWarWillBegin(timeUntilNextWar)) {
//       InformEveryoneThatWarWillBeginSoon();
//       setWarData(true);
//       writeWarDataToFile();
//     }
//   } else {
//     logger.info('Different war dates');
//     setWarData(false,nextWarDate.format());
//     writeWarDataToFile();
//   }
// });

// client.on('message', msg => {
//   if (msg.content === 'ping') {
//     msg.reply('pong');
//     msg.reply(Jokes.getJoke());
//   }

//   if (msg.content === '!nextwar') {
//     const timeUntilNextWar = Events.untilNextWar(moment.utc());
//     const numDays = timeUntilNextWar.days();
//     const numHours = timeUntilNextWar.hours();
//     const numMinutes = timeUntilNextWar.minutes();
//     const numSeconds = timeUntilNextWar.seconds();

//     let output = 'The next war starts in ';
//     if (numDays > 0) {
//       output = output.concat(`${numDays} days, ${numHours} hours, ${numMinutes} minutes and ${numSeconds} seconds.`);
//     } else {
//       if (numHours > 0) {
//         output = output.concat(`${numHours} hours, ${numMinutes} minutes and ${numSeconds} seconds.`);
//       } else {
//         if (numMinutes > 0) {
//           output = output.concat(`${numMinutes} minutes and ${numSeconds} seconds.`);
//         } else {
//           output = output.concat(`${numSeconds} seconds.`);
//         }
//       }
//     }

//     msg.reply(`${output}`);
//   }
// });

// client.login('{token}');