const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const { IBM_ASSISTANT_ID: assistantId, IBM_API_TOKEN: apikey, IBM_API_URL: url, IBM_API_VERSION: version } = process.env;

const assistant = new AssistantV2({ version, url, authenticator: new IamAuthenticator({ apikey }) });

const createSession = async () => {
  try {
    const res = await assistant.createSession({ assistantId });

    return res.result;
  }
  catch (error) {
    return error;
  }
};

const deleteSession = async sessionId => {
  try {
    const res = await assistant.deleteSession({ assistantId, sessionId });
    return res;
  } catch (error) {
    return error;
  }
};

const message = async input => {
  try {
    const { session_id: sessionId } = await createSession();
    const res = await assistant.message({ assistantId, sessionId, input });
    const { status: deleteStatus } = await deleteSession(sessionId);

    if (!deleteStatus === 200) {
      throw new Error('Sessão ibm não pode ser encerrada. Code: ' + deleteRes);
    }
    return res.result;
  } catch (error) {
    return error;
  }
};

module.exports = { message };