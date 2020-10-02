var socket = io("http://10.100.10.235:3000");
var input = ''
var roundTime = 0

const timer = document.getElementById("timer")
var update
var i = 0

socket.on("config", (cfg) => {
  config = cfg
  console.log("Recieved server config")
})

const startGameLoop = function() {
  i = 0
  update = setInterval(function() {
    timer.innerHTML = roundTime-i
    if (i == roundTime) {
      socket.emit("point")
      i = 0
    } else {
      i++
    }
  }, 1000)
}

socket.on("start", (config) => {
  roundTime = config.roundTime
  i = 0
  update = setInterval(function() {
    timer.innerHTML = "~" + (config.initialWaitTime-i).toString()
    if (i >= config.initialWaitTime) {``
      clearInterval(update)
      startGameLoop()
    }
    i++
  }, 1000)
})

socket.on('reconnecting', function reconnectCallback(tries) {
  if (tries === 3) {
       //handle your offline mode here
       console.log("Failed to reconnect 3 times! Offline!")
       clearInterval(update)
  }
});

socket.on('connect', function connectCallback() {
  //handle successful connection here then disconnect
  console.log("Connected to server!")

});

const changeColor = (color) => {
  if (color.match(/^#(?:[0-9a-f]{3}){1,2}$/i)){
    document.body.style.background = color;
  } else {
    console.log("Invalid color")
  }
}

socket.on("capture", function (data) {
  console.log(data)
  changeColor(data.team);
});

window.addEventListener("keypress", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  switch (event.key) {
    case "Enter":
      if (input.length == 10 && input.match(/^[0-9]+$/))
        socket.emit("card", input)
      input = ''
      break;
    default:
      if (event.key.match(/^[0-9]+$/)) {
        input += event.key
      }
      return; 
  }

  if (input.length == 10) {
    socket.emit("card", input)
    input = ''
  }

  // Cancel the default action to avoid it being handled twice
  event.preventDefault();
}, true);