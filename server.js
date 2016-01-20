var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// --------------------------- DB ---------------------------//
var fs = require("fs");
var file = "test.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();


// db.serialize(function() {
//   if(!exists) {
//     db.run("CREATE TABLE Stuff (name TEXT, message TEXT )");
//   }
  
//         var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");
  
// //Insert random data
//   var rnd;
//   for (var i = 0; i < 10; i++) {
//     rnd = Math.floor(Math.random() * 10000000);
//     stmt.run("Thing #" + rnd);
//   }
  
// stmt.finalize();
//   db.each("SELECT rowid AS id, thing FROM Stuff", function(err, row) {
//     console.log(row.id + ": " + row.thing);
//   });
// });

// db.close();

// -------------------- DB -----------------------------//
app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(name, msg){
    var db = new sqlite3.Database(file);
    db.serialize(function() {
      if(!exists) {
        db.run("CREATE TABLE Stuff (name TEXT, message TEXT )");
      }
      
      var stmt = db.prepare("INSERT INTO Stuff VALUES (? , ?)");
      
    //Insert random data
      stmt.run(name, msg);
            
      stmt.finalize();
    });

    db.close();
    io.emit('chat message', name, msg);
  });

  socket.on('new user', function (name, callback){
  	console.log(name + " connected");
    data = [];
    var db = new sqlite3.Database(file);
    db.serialize(function() {
      console.log("New user exists" + exists);
      if(exists) {
        db.all("SELECT name, message FROM Stuff", function(err, row) {
          // var obj = {
          //   "msg" : row.message,
          //   "name" : row.name
          // }
          // data.push(obj);
          callback(true, row);
        });
        console.log("data")
      }
      // callback(true, data);
    });    
    db.close();
  	
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
