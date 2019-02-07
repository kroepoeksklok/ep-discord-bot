const Discord = require('discord.js');
const config = require('./config');
const createLogger = require('logging');
const Events = require('./events');
const moment = require('moment');
const fs = require('fs');
const Jokes = require('./jokes');

class Bot {
  constructor() {
    const self = this;

    this.lastJokeAt = moment.utc().add(-1, 'd');
    this.bot = new Discord.Client({
      autoReconnect: true
    });

    this.logger = createLogger.default('Bot');
    
    // this.sendMessage = (channel, message) => {
    //   logger.info(`Sending message: ${message}`);
    //   channel.send( message );
    // };

    this.bot.on('ready', function () {
      self.printHelloMessage();
    });

    this.bot.on('message', msg => {
      if(self.checkCommands(msg)){
        return;
      }

      self.checkPhrases(msg);
    });
  }

  login() {
    this.bot.login(config.token);
  }

  printHelloMessage() {
    this.logger.info(`Logged in as ${this.bot.user.tag}!`);

    const guildsToSendHelloPhraseTo = config.guildsToSendHelloPhraseTo.split(',');
    const channelsToSendHelloPhraseTo = config.channelsToSendHelloPhraseTo.split(',');

    this.bot.guilds.forEach(guild => {
      if(guildsToSendHelloPhraseTo.find(g => guild.name === g)) {
        guild.channels.forEach(channel => {
          if( channelsToSendHelloPhraseTo.find(c => channel.name === c)) {
            channel.send(config.helloMessage);
          }
        });
      }
    });
  }

  checkCommands(msg) {
    if (msg.content === config.commands.ping) {
      this.logger.info(`${config.commands.ping} command was found`)
      msg.reply('pong');
      return true;
    }

    if(msg.content === config.commands.nextwar) {
      this.logger.info(`${config.commands.nextwar} command was found`)
      this.replyWithNextWarDate(msg);
      return true;
    }

    this.logger.info('No commands were found');
    return false;
  }

  checkPhrases(msg){
    const messageWithoutCommas = this.getStrippedMessage(msg);

    if(this.containsRussia(messageWithoutCommas)) {
      const now = moment.utc();
      const timeSinceLastJoke = now.diff(this.lastJokeAt);
      
      if(timeSinceLastJoke >= config.maximumTimeWithoutJokes) {
        this.lastJokeAt = now;
        const nextJoke = Jokes.getJoke();
        msg.reply(`You mentioned Russia, so here's a joke about russians:\n${nextJoke}`);
      } else {
        this.logger.info(`Last joke was ${timeSinceLastJoke}ms ago. Threshold is at ${config.maximumTimeWithoutJokes}ms.`);
      }
    }
  }

  getStrippedMessage(message) {
    const uppercaseMessage = message.content.toUpperCase();
    return uppercaseMessage.replace(',', '');
  }

  containsRussia(messageWithoutCommas) {
    return messageWithoutCommas.includes(config.phrases.russia);
  }

  replyWithNextWarDate(msg) {
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
}

module.exports = Bot;
// const fs = require('fs');

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