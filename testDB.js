const { db } = require('./firebaseAdmin');

(async () => {
  try {
    const snapshot = await db.collection('test').get();
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
    console.log('Firebase connected thành công');
  } catch (err) {
    console.error(err);
  }
})();
