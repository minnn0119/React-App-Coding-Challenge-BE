const twilio = require("twilio");

const accountSid = "";
const authToken = "";
const serviceSid = "";

const client = twilio(accountSid, authToken);

async function sendSms(toPhone) {
  if (!toPhone) throw new Error("Phone number required");
  return client.verify.v2.services(serviceSid).verifications.create({
    to: toPhone,
    channel: "sms",
  });
}

async function verifySms(toPhone, code) {
  return client.verify.v2.services(serviceSid).verificationChecks.create({
    to: toPhone,
    code: code,
  });
}

module.exports = { sendSms, verifySms };
