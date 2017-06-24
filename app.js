var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var books = require('google-books-search');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/books', function(req, res) {
  books.search(req.body.query, function(error, results) {
    if(!error) {
      res.send(results);
    } else {
      console.error(error);
      res.send(error);
    }
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Book Trading Club is listening on port ' + (process.env.PORT || 3000) + '!');
});
