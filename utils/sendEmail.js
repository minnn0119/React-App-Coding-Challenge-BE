const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  
  let testAccount = await nodemailer.createTestAccount();

  // config transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "minhdiep0119@gmail.com",
      pass: "skrl ojil waue ffyo"
}

  });

  // gửi mail
  const info = await transporter.sendMail({
    from: '"Test App" <test@example.com>',
    to,
    subject,
    html,
  });

  console.log("✅ Email đã gửi thành công!");
  console.log("MessageId:", info.messageId);

  return info;
}

module.exports = sendEmail;
