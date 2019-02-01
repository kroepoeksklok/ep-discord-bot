const Discord = require('discord.js');
const Jokes = require('./Jokes.js');
const moment = require('moment/moment.js');
const client = new Discord.Client();
const Events = require('./events.js');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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