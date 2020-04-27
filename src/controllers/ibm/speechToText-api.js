const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const {
  IBM_SPEECH2TEXT_API_TOKEN: apikey,
  IBM_SPEECH2TEXT_API_URL: url,
} = process.env;

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey
  }),
  url
});

const recognize = async (audio, contentType) => {
  try {
    const params = {
      audio,
      contentType,
      wordAlternativesThreshold: 0.9,
      maxAlternatives: 1
    }
    const res = await speechToText.recognize(params);
    return res.result.results;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = { recognize };