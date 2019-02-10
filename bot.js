const Discord = require('discord.js');
const config = require('./config');
const createLogger = require('logging');
const Events = require('./events');
const moment = require('moment');
const Jokes = require('./jokes');
const WarData = require('./wardata');

class Bot {
  constructor() {
    const self = this;

    this.lastJokeAt = moment.utc().add(-1, 'd');
    this.bot = new Discord.Client({
      autoReconnect: true
    });
    this.mana = 0;
    this.sentFirstManaMessage = false;
    this.sentSecondManaMessage = false;
    this.logger = createLogger.default('Bot');

    this.bot.on('ready', function () {
      self.printHelloMessage();

      const today = moment.utc();
      const nextWarDate = Events.nextWarDate(today);

      if(!WarData.loadWarData()){
        WarData.setWarDate(nextWarDate);
        WarData.setIsAnnounced(false);
      } else {
        if(!nextWarDate.isSame(WarData.getWarDate())){
          WarData.setWarDate(nextWarDate);
          WarData.setIsAnnounced(false);
        }
      }

      self.announceWarIfNecessary(today);
      WarData.saveWarData();
    });

    this.bot.on('message', msg => {
      if(self.checkCommands(msg)){
        return;
      }

      self.checkPhrases(msg);
    });

    
    setInterval(function() {
      self.logger.info('War timer expired.');      

      const today = moment.utc();
      const nextWarDate = Events.nextWarDate(today);

      if(!nextWarDate.isSame(WarData.getWarDate(today))){
        WarData.setWarDate(nextWarDate);
        WarData.setIsAnnounced(false);
      }

      self.announceWarIfNecessary(today);
      WarData.saveWarData();
    }, 1200000); // Run every 20 minutes


    (function loop() {
      const random = Math.round((Math.random() * (600000)) + 600000); // Generates a random number between 600000 and 1200000 (10m, 20m)

      setTimeout(function() {
        self.logger.info('Mana timer expired');
        self.accumulateMana();
        if(self.checkMana()) {
          self.useHarmonicSlam();
        }
        loop();
      }, random);
    }());
  }

  accumulateMana() {
    const manaIncrease = Math.floor((Math.random() * 3) + 1); // Generates 1-3 mana.
    this.mana += manaIncrease;
    this.logger.info(`Mana: ${this.mana} / 100`);
  }

  checkMana() {
    if(this.mana >= 100) return true;

    if(this.mana > 0 && this.mana < 20 && !this.sentFirstManaMessage) {
      this.sendMessage('*starts gathering mana*');
      this.sentFirstManaMessage = true;
    }

    if(this.mana >=97 && this.mana < 100 && !this.sentSecondManaMessage){
      this.sendMessage('*has begun to glow*');
      this.sentSecondManaMessage = true;
    }

    return false;
  }

  useHarmonicSlam() {
    this.sentFirstManaMessage = false;
    this.sentSecondManaMessage = false;
    this.mana = 0;
    const randomUser = this.bot.users.random();
    this.sendMessage(`*uses Harmonic Slam on @${randomUser.tag}!*`);
  }

  announceWarIfNecessary(referenceDate) {
    if(WarData.warIsAnnounced()){
      this.logger.info(`The war of ${WarData.getWarDate().format()} has already been announced`);
    } else {
      this.logger.info(`The war of ${WarData.getWarDate().format()} has not yet been announced`);
      
      const minutesUntilNextWar = Math.round(Events.untilNextWar(referenceDate).as('minutes'));

      if(minutesUntilNextWar <= config.minutesToAnnounceWar) {
        this.logger.info(`${minutesUntilNextWar} <= ${config.minutesToAnnounceWar}: annoucing war`);
        this.announceWar(minutesUntilNextWar);
        WarData.setIsAnnounced(true);
      } else {
        this.logger.info(`${minutesUntilNextWar} > ${config.minutesToAnnounceWar}: not annoucing war`);
      }
    }
  }

  sendMessage(message, channelId) {
    let cId;

    if(!channelId) {
      cId = config.idDefaultChannel;
    } else {
      cId = channelId;
    }

    this.logger.info(`Sending the following message to channel ${cId}: ${message}`);
    this.bot.channels.get(cId).send(message);
  }

  announceWar(minutesUntilNextWar) {
    this.sendMessage(`@everyone: the next war starts in ${minutesUntilNextWar} minutes.`, config.idWarChannel);
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
      this.logger.info(`${config.commands.ping} command was found`);
      msg.reply('pong');
      return true;
    }

    if(msg.content === config.commands.nextwar) {
      this.logger.info(`${config.commands.nextwar} command was found`);
      this.replyWithNextWarDate(msg);
      return true;
    }

    if(msg.content === config.commands.farmred){
      this.logger.info(`${config.commands.farmred} command was found`);
      msg.reply('The best place to farm red enemies is 19.4, 19.6, 20.4 and 20.7. For lower levels / less energy, use the following levels: 2.2, 5.8, 11.6 and 13.1');
      return true;
    }

    if(msg.content === config.commands.farmblue){
      this.logger.info(`${config.commands.farmblue} command was found`);
      msg.reply('The best place to farm blue enemies is 8.1, 8.3, 8.5, 9.1, 9.3, 13.5 and 13.8');
      return true;
    }

    if(msg.content === config.commands.farmgreen){
      this.logger.info(`${config.commands.farmgreen} command was found`);
      msg.reply('The best place to farm blue enemies is 6.3, 6.6, 7.5 and 17.5');
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
        msg.reply(`you mentioned Russia, so here's a joke about russians:\n${nextJoke}`);
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