const Discord = require('discord.js');
const moment = require('moment');
const fs = require('fs');
const createLogger = require('logging');

const Jokes = require('./Jokes.js');
const Events = require('./events.js');

const logger = createLogger.default('Bot');
const client = new Discord.Client();

let warData = {};

client.on('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);

  warData = JSON.parse(fs.readFileSync('file', 'utf8'));
  logger.info(`${warData.nextWar}`);
  logger.info(`${warData.announcedWar}`);

  const nextWarDate = Events.nextWarDate(moment.utc());
  const storedWarDate = moment.utc(warData.nextWar);

  logger.info(nextWarDate);
  logger.info(storedWarDate);

  if(nextWarDate.isSame(storedWarDate)){
    logger.info('Same war dates');
    if(warData.announcedWar){
      logger.info('Already announced');
    } else {
      logger.info('Not yet announced');
    }
  } else {
    logger.info('Different war dates');
    warData.nextWar = nextWarDate.format();
    warData.announcedWar = false;

    fs.writeFile('file', JSON.stringify(warData), function(err) {
      if(err){
        logger.error(err);
      }
      logger.info('War data saved');
    });
  }
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
    msg.reply(Jokes.getJoke());
  }

  if (msg.content === '!nextwar') {
    const startsIn = Events.nextWar(moment.utc());
    const dur = moment.duration(startsIn);
    const numDays = dur.days();
    const numHours = dur.hours();
    const numMinutes = dur.minutes();
    const numSeconds = dur.seconds();

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

client.login('{token}');