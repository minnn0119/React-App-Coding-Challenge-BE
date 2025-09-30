const twilio = require("twilio");

const accountSid = "AC792b13fe585efaa8be45a6a721dcf2df";
const authToken = "877a17e8481d97826efe8ac3009b1d95";
const serviceSid = "VAb2682b27e696bddc8b9e4965e7cc9b83";

const client = twilio(accountSid, authToken);

async function sendSms(toPhone) {
  if (!toPhone) throw new Error("❌ Phone number required");
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
