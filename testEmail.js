const sendEmail = require('./utils/sendEmail');

(async () => {
  try {
    const info = await sendEmail(
      "lokiminh@gmail.com", 
      "🔔 Test Email từ Node.js",
      "<h1>Hello!</h1><p>Đây là email test gửi bằng <b>nodemailer</b>.</p>"
    );

    console.log("Email đã gửi thành công!");
    console.log("MessageId:", info.messageId);
  } catch (err) {
    console.error(err.message);
  }
})();
