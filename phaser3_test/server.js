const express = require('express');
const app = express();

console.log(__dirname)

app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});