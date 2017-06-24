var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/post', function(req, res) {
  res.send(req.body);
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Book Trading Club is listening on port ' + (process.env.PORT || 3000) + '!');
});
