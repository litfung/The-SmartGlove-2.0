var io = require("socket.io-client");

class Glove {
  constructor(roomID, local = false) {
    this.roomID = roomID;
    this.batteryLevel = 100;
    this.timer = 0;
    this.streamInterval = 12;
    this.dataStream;
    this.realtimeTest = true;

    this.x = 0;
    setInterval(() => {
      this.x += 5;
      this.x > 100 ? (this.x = 0) : (this.x = this.x);
      console.log(this.x);
    }, 500);

    var socket = io.connect(
      local
        ? "http://127.0.0.1:80/" + roomID
        : "https://thesmartglove.herokuapp.com/" + roomID,
      { query: { room: roomID }, reconnect: true }
    );

    socket.on("connect", () => {
      socket.emit("gloveConnect");
      socket.emit("streamInterval", 14);
      setInterval(() => {
        socket.emit("batteryLevel", this.simulateBattery());
      }, 800);
    });

    socket.on("streamState", state => {
      if (state) {
        this.dataStream = setInterval(() => {
          socket.emit(
            "sensorData",
            // this.realtimeTest ? this.realtime() : this.simulateData()
            this.realtime()
          );
        }, this.streamInterval);
      } else {
        clearInterval(this.dataStream);
      }
    });
  }

  simulateData() {
    let sensorData = [];
    this.timer += 0.04;
    for (var i = 0; i < 12; i++) {
      sensorData.push(Math.abs(100 * Math.sin(i * 0.55 + this.timer)));
    }
    return sensorData;
  }

  simulateBattery() {
    this.batteryLevel -= 0.1;
    return Math.floor(this.batteryLevel);
  }

  realtime() {
    let sensorData = [];
    for (var i = 0; i < 12; i++) {
      sensorData.push(this.x);
    }
    return sensorData;
  }
}

var args = process.argv.slice(2);

new Glove(args[0] || "demo", true);
