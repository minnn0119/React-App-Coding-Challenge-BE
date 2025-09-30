const { sendSms } = require("./utils/sendSms"); 

(async () => {
  try {
    const sid = await sendSms("+84339057046"); 
    console.log("Kết quả test: SID =", sid);
  } catch (err) {
    console.error(err.message);
  }
})();
