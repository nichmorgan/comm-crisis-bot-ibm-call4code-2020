const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const {
  IBM_LANG_API_TOKEN: apikey,
  IBM_LANG_API_URL: url,
  IBM_LANG_API_VERSION: version
} = process.env;


const languageTranslator = new LanguageTranslatorV3({
  version,
  url,
  authenticator: new IamAuthenticator({ apikey }),
});

const langTranslateList = async () => {
  try {
    const res = await languageTranslator.listModels();
    return res.result.models.map(arr => arr.model_id);
  } catch (error) {
    console.error(error);
    return [];
  }
}

const identify = async text => {
  try {
    const res = await languageTranslator.identify({ text });
    return res.result.languages[0].language;

  } catch (error) {
    console.error(error);
    return error
  }
};

const translate = async (text, targetLang) => {
  try {
    const lang = await identify(text);
    const modelId = `${lang}-${targetLang}`;
    const modelsList = await langTranslateList();

    if ((lang !== targetLang) && (modelsList.includes(modelId))) {
      const res = await languageTranslator.translate({ text, modelId });
      return res.result.translations[0].translation;
    } else {
      return text;
    }
  } catch (error) {
    console.error(error);
    return error
  }
};


module.exports = { translate };