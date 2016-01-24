var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dateformat = require('dateformat');

var fs = require("fs");
var file = "test.db";
var sqlite3 = require("sqlite3").verbose();

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(name, msg, date){
    var db = new sqlite3.Database(file);
    var newDate = dateformat(date, 'yyyy-mm-dd hh:MM:ss');
    db.serialize(function() {
      
      var stmt = db.prepare("INSERT INTO Stuff VALUES (? , ? , ?)");
      
      console.log(newDate);
      stmt.run(name, msg, newDate);
      stmt.finalize();
    });

    db.close();
    io.emit('chat message', name, msg, newDate);
  });

  socket.on('new user', function (name, callback){
    var exists = fs.existsSync(file);
  	console.log(name + " connected");
    data = [];
    var db = new sqlite3.Database(file);
    db.serialize(function() {
      console.log("New user exists" + exists);
      if(!exists) {
        db.run("CREATE TABLE Stuff (name TEXT, message TEXT , current TEXT)");
      }
      db.all("SELECT name, message, datetime(current) as current_date FROM Stuff", function(err, row) {
        if(row){
          console.log(row);
          callback(true, row);  
        } else {
          callback(true, []);
        }
        
      });
    });    
    db.close();
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
