const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' }});
const cors = require('cors');
const bodyParser = require('body-parser');
const { db } = require('./firebaseAdmin');

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', require('./routes/auth'));
app.use('/instructor', require('./routes/instructor'));
app.use('/student', require('./routes/student'));
app.use('/user', require('./routes/user'));



const setupSocket = require('./socket');
setupSocket(io, db);

const PORT = 4000;
http.listen(PORT, () => console.log(`Server running on ${PORT}`));
