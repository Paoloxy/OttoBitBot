const TelegramBot = require('node-telegram-bot-api');
const f  = require('./functions.js');


const token = '437824992:AAHHjUJ2fsap4IK6c61iI4_j-8G9HaXxYpM';
//const bot = new TelegramBot(token, {polling: true});

const fakeGroup = -490939625;
const Paoloxy = 198536910;


f.bot.on('channel_post', async (msg)=> {
  await functions.photoPost(msg);
});


f.bot.on('photo',  async (msg) => {
  functions.photoPost(msg);
});


