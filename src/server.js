const MongoClient = require('mongodb').MongoClient;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const userList = {}
const clients = {}
const teams = {}

var port = process.env.PORT || 3000;
var config = {
  initialWaitTime: 60,
  roundTime: 30
}
var gameStarted = 0

// Start the Server
http.listen(port, function () {
    console.log('Server Started. Listening on *:' + port);
});
// Express Middleware
app.use(express.static('public/server'));
app.use(bodyParser.urlencoded({
    extended: true
}));
// Render Main HTML file
app.get('/', function (req, res) {
    res.sendFile('index.html');
});


MongoClient.connect('mongodb://localhost:27017/cardgame', { useUnifiedTopology: true }, function (err, client) {
  if (err) throw err

  var db = client.db('cardgame')

  db.collection('cards').find().toArray(function (err, result) {
    if (err) throw err
    result.forEach((data) => {
      userList[data.card] = data;
    });
    console.log(userList)
  })

  db.collection('teams').find().toArray(function (err, result) {
    if (err) throw err
    result.forEach((data) => {
      teams[data.team_id] = data;
    });
  })
})

io.on("connection", (s) => {
  clients[s.id] = {
    client: s,
    belongs: -1
  };

  if (gameStarted != 0) {
    var a = config
    a.initialWaitTime = -Math.round(Date.now() / 1000 - (config.initialWaitTime + gameStarted))
    s.emit("start", a)
  }

  console.log("Made socket connection %s", s.id);

  s.on("card", function (data) {
    console.log("Card relayed: %s", data)
    userList[data].beeps++;
    clients[s.id].belongs = userList[data].team
    s.emit("capture", {
      team: teams[userList[data].team].color,
      time: 0
    })
  });

  s.on("point", () => {
    if (clients[s.id].belongs != -1) {
      teams[clients[s.id].belongs].points++
      console.log("Team %s now has %s points", clients[s.id].belongs, teams[clients[s.id].belongs].points)
    } 
  })

  s.on("disconnect", () => {
    delete clients[s.id]
    console.log("client disconnected %s", s.id);
  });
});

var stdin = process.openStdin();
stdin.addListener("data", function(d) {
    const data = d.toString().trim()
    switch(data) {
      case "start":
        gameStarted = Date.now() / 1000
        Object.values(clients).forEach((c) => {
          c.client.emit("start", config);
        })
        console.log("Game started");
        break
      default:
        console.log("Command not found")
    }
});