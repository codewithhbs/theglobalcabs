// Pluggable SMS service: Twilio or Fast2SMS (India). Set SMS_PROVIDER in .env
const sendViaTwilio = async (to, message) => {
  const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await twilio.messages.create({ body: message, from: process.env.TWILIO_PHONE, to });
};

const sendViaFast2Sms = async (to, message) => {
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ route: 'q', message, numbers: to.replace(/^\+91/, '') }),
  });
  if (!res.ok) throw new Error(`Fast2SMS error ${res.status}`);
};

const sendSms = async (to, message) => {
  const provider = (process.env.SMS_PROVIDER || 'none').toLowerCase();
  try {
    if (provider === 'twilio') await sendViaTwilio(to, message);
    else if (provider === 'fast2sms') await sendViaFast2Sms(to, message);
    else console.log(`[sms skipped - provider=none] to=${to}: ${message}`);
  } catch (err) {
    console.error('SMS send failed:', err.message);
  }
};

module.exports = sendSms;
