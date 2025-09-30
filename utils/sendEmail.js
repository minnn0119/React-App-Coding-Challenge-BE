const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "minhdiep0119@gmail.com",
      pass: "skrl ojil waue ffyo"
}

  });


  const info = await transporter.sendMail({
    from: '"Test App" <test@example.com>',
    to,
    subject,
    html,
  });

  return info;
}

module.exports = sendEmail;
