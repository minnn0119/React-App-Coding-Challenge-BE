const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

router.put('/editProfile', async (req, res) => {
  try {
    const { phone, name, email } = req.body;
    const phoneNumber = Number(phone);
    const q = await db.collection('users').where('phone', '==', phoneNumber).limit(1).get();

    if (q.empty) {
      return res.status(404).json({ thongBao: 'Không tìm thấy người dùng' });
    }

    const id = q.docs[0].id;
    await db.collection('users').doc(id).update({
      name,
      email,
      updatedAt: Date.now()
    });

    return res.json({ thanhCong: true, thongBao: 'Đã cập nhật hồ sơ' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ thongBao: 'Lỗi hệ thống' });
  }
});

router.get('/myLessons', async (req, res) => {
  try {
    const { phone } = req.query;
    const phoneNumber = Number(phone);
    const q = await db.collection('users')
      .where('phone', '==', phoneNumber)
      .limit(1)
      .get();

    if (q.empty) {
      return res.status(404).json({ thongBao: 'Không tìm thấy học viên' });
    }

    const userId = q.docs[0].id;
    const lessonsSnap = await db.collection('lessons').where('studentId', '==', userId).get();

    const danhSachBaiHoc = lessonsSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    return res.json({ baiHoc: danhSachBaiHoc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ thongBao: 'Lỗi hệ thống' });
  }
});


router.post('/markLessonDone', async (req, res) => {
  try {
    const { phone, lessonId } = req.body;
    const q = await db.collection('users').where('phone', '==', phone).limit(1).get();

    if (q.empty) {
      return res.status(404).json({ thongBao: 'Không tìm thấy học viên' });
    }

    const userId = q.docs[0].id;
    const lessonRef = db.collection('lessons').doc(lessonId);
    const lessonSnap = await lessonRef.get();

    if (!lessonSnap.exists) {
      return res.status(404).json({ thongBao: 'Không tìm thấy bài học' });
    }

    if (lessonSnap.data().studentId !== userId) {
      return res.status(403).json({ thongBao: 'Bạn không có quyền chỉnh sửa bài học này' });
    }

    await lessonRef.update({
      status: 'done',
      updatedAt: Date.now()
    });

    return res.json({ thanhCong: true, thongBao: 'Đã đánh dấu hoàn thành' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ thongBao: 'Lỗi hệ thống' });
  }
});

module.exports = router;
