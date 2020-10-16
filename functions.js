const TelegramBot = require('node-telegram-bot-api');
const { JsonDB }  = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const sharp =  require('sharp');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { kMaxLength } = require('buffer');
const rimraf = require('rimraf');
const { UV_FS_O_FILEMAP } = require('constants');

const token = '4%';
const bot = new TelegramBot(token, {polling: true});

const fakeGroup = -490939625;
const Paoloxy = 198536910;

async function photoPost(msg) {

    const name = await savePhoto(msg);
    const originalpath = './images/' + name + '/original.jpg';

    const deletephoto = await bot.deleteMessage(msg.chat.id, msg.message_id);



    var img_id = await resize('./images/' + name, 9);

    const image = await bot.sendPhoto(msg.chat.id, img_id, { caption: '10' });

    let counter = 10;
    let flag = 10;

    while (flag--) {

        while (counter-- && isSolved(name)) {

            bot.editMessageCaption("Miglioramento tra " + counter + " secondi (" + (10 - flag) + "/10)", {
                chat_id: msg.chat.id,
                message_id: image.message_id,
            });

            await sleep(1000);
        }
        counter = 10;

        img_id = await resize('./images/' + name, flag);

        await bot.editMessageMedia({
            type: 'photo',
            media: img_id,
            caption: "Miglioramento..."
        }, {
            chat_id: msg.chat.id,
            message_id: image.message_id,
        });

    }
    bot.editMessageMedia({
        type: 'photo',
        media: msg.photo[msg.photo.length - 1].file_id,
        caption: "Immagine originale"
    }, {
        chat_id: msg.chat.id,
        message_id: image.message_id,
    });
}
async function resize(path, factor) {

    factor = 10 * (10 - factor);

    const originalpath = path + '/original.jpg';
    const resizedpath = path + '/resized.jpg';

    const downscaled = await sharp(originalpath).resize(factor).jpeg().toBuffer();
    const upscaled = await sharp(downscaled).resize(1024, null, { kernel: "nearest" }).jpeg().toBuffer();

    fs.writeFileSync(resizedpath, upscaled);

    const fakeMessage = await bot.sendPhoto(fakeGroup, resizedpath);
    return fakeMessage.photo[fakeMessage.photo.length - 1].file_id;
}
function newName(name) {
    fs.appendFileSync('./unsolved.txt', '\n' + name, () => { });
}
async function savePhoto(msg) {
    const name = msg.caption.replace(/\s+/g, '');
    const path = './images/' + name;
    mkdirp(path);

    const file_id = msg.photo[msg.photo.length - 1].file_id;

    const file = await bot.downloadFile(file_id, path);
    fs.renameSync(file, path + "/original.jpg");
    newName(name);
    return name;
}
async function isSolved(name) {
    fs.readFileSync('./solved.txt', function (err, data) {
        if (err)
            throw err;
        if (data.indexOf(name) >= 0) {
            return 0;
        }
    });
}
function clearDB() {
    rimraf.sync("./images/");
    fs.writeFile('./solved', '');
    fs.writeFile('./unsolved', '');
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.photoPost = photoPost;
