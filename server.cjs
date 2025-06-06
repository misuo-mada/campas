const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000; // ← 修正ポイント！
app.use(express.static(path.join(__dirname, 'public')));

let imageHistory = [];

io.on('connection', (socket) => {
  console.log('✅ ユーザー接続');

  // 履歴送信
  imageHistory.forEach(dataUrl => {
    socket.emit('history', dataUrl);
  });

  // 線描画中継
  socket.on('draw', ({ from, to, color, width }) => {
    socket.broadcast.emit('draw', { from, to, color, width });
  });

  // ✅ 全体クリア → 双方向に反映
  socket.on('clear', () => {
    io.emit('clear');
  });

  // 履歴保存中継
  socket.on('saveHistory', (dataUrl) => {
    imageHistory.push(dataUrl);
    io.emit('history', dataUrl);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 http://localhost:${PORT} でサーバー起動中`);
});
