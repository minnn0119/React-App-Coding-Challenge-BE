const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const sendEmail = require('../utils/sendEmail');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');


const JWT_SECRET = "matkhau_bimat";

function xacThucGiangVien(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ thongBao: 'Chưa đăng nhập' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'instructor')
      return res.status(403).json({ thongBao: 'Không có quyền' });
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ thongBao: 'Token không hợp lệ' });
  }
}

router.post('/addStudent', xacThucGiangVien, async (req, res) => {
  try {
    let { name, phone, email } = req.body;
    if (!name || !phone || !email) return res.status(400).json({ thongBao: 'Thiếu thông tin' });

    phone = Number(phone);

    const userRef = db.collection('users').doc();
    const duLieuHV = { name, phone, email, role: 'student', createdAt: Date.now(), isDeleted: false };
    await userRef.set(duLieuHV);


    const token = uuidv4();
    await db.collection('setupTokens').doc(token).set({
      userId: userRef.id,
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    });


    const link = `http://localhost:3000/setup?token=${token}`;
    await sendEmail(email, 'Tạo tài khoản học viên', `Xin chào ${name}, bấm vào <a href="${link}">đây</a> để tạo mật khẩu.`);

    return res.json({ thanhCong: true, maHocVien: userRef.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ thongBao: 'Lỗi máy chủ' });
  }
});




router.post('/assignLesson', xacThucGiangVien, async (req, res) => {
  try {
    let { studentPhone, title, description } = req.body;
    studentPhone = Number(studentPhone);

    const q = await db.collection('users').where('phone', '==', studentPhone).limit(1).get();
    if (q.empty) return res.status(404).json({ thongBao: 'Không tìm thấy học viên' });

    const studentId = q.docs[0].id;
    const lessonRef = db.collection('lessons').doc();
    await lessonRef.set({
      studentId,
      title,
      description,
      status: 'assigned',
      createdAt: Date.now()
    });

    return res.json({ thanhCong: true, maBaiHoc: lessonRef.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra' });
  }
});


router.get('/students', xacThucGiangVien, async (req, res) => {
  try {
    const snapshot = await db
      .collection('users')
      .where('isDeleted', '==', false)
      .where('role', '==', 'student')
      .get();

    const dsHocVien = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(dsHocVien);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra' });
  }
});



router.get('/student/:phone', xacThucGiangVien, async (req, res) => {
  try {
    const phone = Number(req.params.phone);
    const q = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (q.empty) return res.status(404).json({ thongBao: 'Không tìm thấy học viên' });

    const u = q.docs[0];
    const lessonsSnap = await db.collection('lessons').where('studentId', '==', u.id).get();
    const dsBaiHoc = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return res.json({ id: u.id, ...u.data(), baiHoc: dsBaiHoc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra' });
  }
});


router.put('/editStudent/:phone', xacThucGiangVien, async (req, res) => {
  try {
    const phone = Number(req.params.phone);
    const q = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (q.empty) return res.status(404).json({ thongBao: 'Không tìm thấy học viên' });

    const id = q.docs[0].id;
    await db.collection('users').doc(id).update({ ...req.body, phone, updatedAt: Date.now() });

    return res.json({ thanhCong: true, thongBao: 'Đã cập nhật thông tin học viên' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra' });
  }
});


router.delete('/student/:phone', xacThucGiangVien, async (req, res) => {
  try {
    const phone = Number(req.params.phone);
    const q = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (q.empty) return res.status(404).json({ thongBao: 'Không tìm thấy học viên' });

    const id = q.docs[0].id;
    await db.collection('users').doc(id).update({ isDeleted: true, updatedAt: Date.now() });

    return res.json({ thanhCong: true, thongBao: 'Đã xóa học viên' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ thongBao: 'Có lỗi xảy ra' });
  }
});

module.exports = router;
