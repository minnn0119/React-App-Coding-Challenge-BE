const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const { sendSms, verifySms } = require('../utils/sendSms');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = "matkhau_bimat";

router.post("/createOTP", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ loi: "Cần nhập số điện thoại" });

    await sendSms(phone);
    return res.json({ thanhCong: true, thongBao: "Đã gửi mã OTP qua SMS" });
  } catch (e) {
    console.error("Lỗi khi tạo mã:", e.message);
    return res.status(500).json({ loi: "Lỗi server" });
  }
});

router.post("/verifyOTP", async (req, res) => {
  try {
    const { phone, maXacThuc } = req.body;
    if (!phone || !maXacThuc)
      return res.status(400).json({ loi: "Thiếu số điện thoại hoặc mã OTP" });

    const check = await verifySms(phone, maXacThuc);
    if (check.status !== "approved") {
      return res.status(400).json({
        thanhCong: false,
        thongBao: "Mã không hợp lệ hoặc đã hết hạn"
      });
    }

    const q = await db.collection("users").where("phone", "==", phone).limit(1).get();
    let user;
    if (q.empty) {
      const newUser = {
        phone,
        email: null,
        name: null,
        role: "student",
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const ref = await db.collection("users").add(newUser);
      user = { id: ref.id, ...newUser };
    } else {
      user = { id: q.docs[0].id, ...q.docs[0].data() };
    }

    const payload = {
      id: user.id,
      email: user.email || null,
      phone: user.phone || null,
      name: user.name || null,
      role: user.role || "student",
      isDeleted: user.isDeleted ?? false,
      createdAt: user.createdAt || Date.now(),
      updatedAt: user.updatedAt || Date.now(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ thanhCong: true, token });
  } catch (e) {
    console.error("Lỗi verifyOTP:", e.message);
    return res.status(500).json({ loi: "Lỗi server" });
  }
});


router.post('/loginEmail', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ loi: 'Cần nhập email' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await db.collection('accessCodes').doc(email).set({
      code,
      taoLuc: Date.now(),
      hetHanLuc: Date.now() + 1000 * 60 * 10
    });

    await sendEmail(email, 'Mã đăng nhập hệ thống', `Mã truy cập của bạn là: ${code}`);

    return res.json({ thanhCong: true, thongBao: "Đã gửi mã vào email" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ loi: 'Có lỗi khi gửi email' });
  }
});


router.post('/verifyEmail', async (req, res) => {
  try {
    const { email, maXacThuc } = req.body;
    const docRef = db.collection('accessCodes').doc(email);
    const snapshot = await docRef.get();

    if (!snapshot.exists)
      return res.status(400).json({ thanhCong: false, thongBao: 'Không tìm thấy mã' });

    const data = snapshot.data();
    if (data.hetHanLuc < Date.now())
      return res.status(400).json({ thanhCong: false, thongBao: 'Mã đã hết hạn' });

    if (data.code !== maXacThuc)
      return res.status(400).json({ thanhCong: false, thongBao: 'Mã không đúng' });


    await docRef.delete();


    const q = await db.collection("users").where("email", "==", email).limit(1).get();
    let user;
    if (q.empty) {
      const newUser = {
        email,
        phone: null,
        name: null,
        role: "student",
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const ref = await db.collection("users").add(newUser);
      user = { id: ref.id, ...newUser };
    } else {
      user = { id: q.docs[0].id, ...q.docs[0].data() };
    }


    const payload = {
      id: user.id,
      email: user.email || null,
      phone: user.phone || null,
      name: user.name || null,
      role: user.role || "student",
      isDeleted: user.isDeleted ?? false,
      createdAt: user.createdAt || Date.now(),
      updatedAt: user.updatedAt || Date.now(),
    };


    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ thanhCong: true, token });
  } catch (e) {
    console.error("Lỗi verifyEmail:", e);
    return res.status(500).json({ loi: 'Lỗi server' });
  }
});

module.exports = router;
