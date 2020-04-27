const fs = require('fs');
const tmp = require('tmp');
const http = require('https');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_API_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// IBM API
const ibmChatApi = require('./src/controllers/ibm/chat-api');
const ibmTranslateApi = require('./src/controllers/ibm/lang-translate-api');
const ibmTranscriptApi = require('./src/controllers/ibm/speechToText-api');

// Matches "/echo [whatever]"
bot.onText(/\/start?(.+)/, async msg => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const { from: { id: chatId } } = msg;
  const input = {
    mesage_type: 'text',
    text: 'Hi'
  };
  try {
    const { output: { generic: resp } } = await ibmChatApi.message(input);
    await bot.sendMessage(chatId, resp[0].text);

  } catch (error) {
    await bot.sendMessage(chatId, error);
  }
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('text', async msg => {
  const { from: { id: chatId }, from: { is_bot } } = msg;
  let { text } = msg;

  text = await ibmTranslateApi.translate(text, 'en')

  if (!is_bot) {
    const input = {
      mesage_type: 'text',
      text
    };
    try {
      let { output: { generic: resp } } = await ibmChatApi.message(input);
      resp = await ibmTranslateApi.translate(resp[0].text, 'pt');
      await bot.sendMessage(chatId, resp);

    } catch (error) {
      await bot.sendMessage(chatId, `Ocorreu um erro: ${error}.`);
    }
  }
});

bot.on('voice', async voice => {
  const {
    from: { id: chatId },
    from: { is_bot },
    voice: { file_id: audioId },
  } = voice;

  const audioType = 'audio/ogg';

  await bot.sendMessage(chatId, 'Chat por voz ainda em desenvolvimento.');
  return;
  if (!is_bot) {
    try {
      const audioLink = await bot.getFileLink(audioId);


      const audioRequest = http.get(audioLink, async response => {
        const tmpFile = tmp.fileSync({ postfix: '.ogg' });

        let audioStream = fs.createWriteStream(tmpFile.name);
        response.pipe(audioStream);
        audioStream.close();

        audioStream = fs.createReadStream(tmpFile.name);
        const transcryptedAudio = await ibmTranscriptApi.recognize(audioStream, audioType);
        audioStream.close();

        if (!transcryptedAudio)
          throw new Error('Falha na transcrição de áudio.');
        else if (transcryptedAudio.length === 0) {
          await bot.sendMessage(chatId, `Não foi possível entender o áudio.`);
        }
        else {
          const input = {
            mesage_type: 'text',
            textScore: transcryptedAudio[0].alternatives[0].confidence,
            text: transcryptedAudio[0].alternatives[0].transcript
          };

          let { output: { generic: resp } } = await ibmChatApi.message(input);
          resp = await ibmTranslateApi.translate(resp[0].text, 'pt');
          await bot.sendMessage(chatId, resp);
        }

        tmpFile.removeCallback();

      });

    } catch (error) {
      await bot.sendMessage(chatId, `Ocorreu um erro: ${error}`);
    }
  }
});
