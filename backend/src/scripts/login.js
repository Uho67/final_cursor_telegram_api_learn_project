require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input'); // npm i input

async function login() {
  const apiId = process.env.TELEGRAM_API_ID;
  const apiHash = process.env.TELEGRAM_API_HASH;
  
  if (!apiId || !apiHash) {
    console.error('Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in your .env file');
    process.exit(1);
  }

  const client = new TelegramClient(
    new StringSession(''),
    parseInt(apiId),
    apiHash,
    {
      connectionRetries: 5,
    }
  );

  await client.start({
    phoneNumber: async () => await input.text('Please enter your phone number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () => await input.text('Please enter the code you received: '),
    onError: (err) => console.log(err),
  });

  console.log('You should now be connected.');
  console.log('Session string:', client.session.save());
  console.log('Add this session string to your .env file as TELEGRAM_SESSION');
  
  await client.disconnect();
}

login().catch(console.error); 