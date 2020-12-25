var express = require('express');
var app = express();
var path = require('path');
const { readdirSync } = require('fs')
var bodyParser = require('body-parser')
const { spawn, spawnSync } = require('child_process');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const port = 8000;
const wsDir = '../mvn-test-projects';
const socket = new WebSocket('ws://localhost:8080');

socket.on('open', function open() {
  socket.send('WS server is ready!');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../index.html'));
});

const getDirectories = source => {
  return readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

app.get('/list/dir', function (req, res) {
  let dirs = getDirectories(wsDir) || [];
  res.send(dirs);
});

app.post('/build', function (req, res) {
  let modules = req.body;
  console.log('Body:', modules);
  let result = modules.forEach(async module => await execute('mvn', ['clean', 'install', '-f', wsDir + '/' + module + '/pom.xml']));
  console.log(result);
  socket.send(JSON.stringify(result));
  res.sendStatus(200);
});

app.use(express.static('src'));

app.listen(port);
console.log('Running on port', port);

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

async function execute(command, args) {
  const child = await spawn(command, args);
  child.stdout.on('data', (data) => {
    socket.send(data);
  });
  
  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

const reader = require('./read-pom');
const pomFiles = [];

reader(pomFiles);
