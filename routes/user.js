const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

router.get('/users', async (req, res) => {
  try {

    const usersSnap = await db.collection('users')
      .where('isDeleted', '==', false)
      .get();

    if (usersSnap.empty) {
      return res.status(404).json({ thongBao: 'Không có người dùng nào' });
    }

    const danhSachUser = usersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ users: danhSachUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ thongBao: 'Lỗi hệ thống' });
  }
});

module.exports = router;
