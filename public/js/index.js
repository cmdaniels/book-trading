var provider = new firebase.auth.TwitterAuthProvider();
var database = firebase.database();
var loggedIn = false;
var userId;

function login(){
  if(!loggedIn){
    firebase.auth().signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      var secret = result.credential.secret;
      var user = result.user;
      userId = user.uid;
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      console.error(errorCode, errorMessage, email, credential);
    });
  } else {
    firebase.auth().signOut().then(function() {
      userId = '';
    }, function(error) {
      console.error('Sign Out Error', error);
    });
  }
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    loggedIn = true;
    userId = user.uid;
    $('.displayName').html(user.displayName);
    $('#login').html('Sign Out <i class="fa fa-sign-out" aria-hidden="true"></i>');
    $('.loggedIn').removeClass('hidden');
    $('.prompt').removeClass('hidden');
    $('.settings').removeClass('hidden');
    database.ref('users/' + userId).once('value').then(function(snapshot) {
      if (snapshot.val().hasOwnProperty('city')) {
        $('#city')[0].value = snapshot.val().city;
      }
      if (snapshot.val().hasOwnProperty('state')) {
        $('#state')[0].value = snapshot.val().state;
      }
    });
    database.ref('books/').once('value').then(function(snapshot) {
      for(var key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          var book = snapshot.val()[key];
          if(book.lender === userId) {
            $('.myBooks').append('<a href="#" class="thumbnail book" id="my-' + key + '" onclick="removeBook(this.id)">'+
              '<img src="' + book.thumbnail + '" alt="' + book.title + '">'+
            '</a>');
          }
          if(book.borrower === userId && book.request === "confirmed") {
            $('.tradedBooks').append('<a href="#" class="thumbnail book" id="traded-' + key + '" onclick="returnBook(this.id)">'+
              '<img src="' + book.thumbnail + '" alt="' + book.title + '">'+
            '</a>');
          }
          if(book.lender === userId && book.request === "pending") {
            $('.tradeRequests').append('<a href="#" class="thumbnail book" id="request-' + key + '" onclick="confirmTrade(this.id)">'+
              '<img src="' + book.thumbnail + '" alt="' + book.title + '">'+
            '</a>');
          }
        }
      }
    });
  } else {
    loggedIn = false;
    $('#login').html('Log In with Twitter <i class="fa fa-twitter" aria-hidden="true"></i>');
    $('.loggedIn').addClass('hidden');
    $('.prompt').addClass('hidden');
    $('.settings').addClass('hidden');
    $('.myBooks').html('');
    $('.tradeRequests').html('');
    $('.tradedBooks').html('');
  }
});

// Update user settings in modal
function updateSettings() {
  var updates = {
    city: $('#city')[0].value,
    state: $('#state')[0].value
  };
  database.ref('users/' + userId).update(updates);
}

// Add book to available books and to user's library
function addBook() {
  $.post('/books', {
    query: $('#bookTitle')[0].value
  }, function(results) {
    $('#bookTitle')[0].value = '';
    database.ref('books/' + results[0].id).set({
      title: results[0].title,
      thumbnail: results[0].thumbnail,
      lender: userId,
      borrower: '',
      request: 'none'
    });
    var book = results[0];
    $('.available').append('<a href="#" class="thumbnail book" id="available-' + book.id + '" onclick="requestBook(this.id)">'+
      '<img src="' + book.thumbnail + '" alt="' + book.title + '">'+
    '</a>');
    $('.myBooks').append('<a href="#" class="thumbnail book" id="my-' + book.id + '" onclick="removeBook(this.id)">'+
      '<img src="' + book.thumbnail + '" alt="' + book.title + '">'+
    '</a>');
  });
}

// Remove a book from one's own library
function removeBook(id) {
  id = id.split('-')[1];
  $('#available-' + id).remove();
  $('#my-' + id).remove();
  $('#request-' + id).remove();
  $('#traded-' + id).remove();
  database.ref('books/' + id).remove();
}

// Request a book from someone else's library
function requestBook(id) {
  if(loggedIn) {
    id = id.split('-')[1];
    $('#available-' + id).remove();
    var updates = {
      borrower: userId,
      request: 'pending'
    };
    database.ref('books/' + id).update(updates);
  }
}

// Confirm a trade request
function confirmTrade(id) {
  id = id.split('-')[1];
  $('#request-' + id).remove();
  var updates = {
    request: 'confirmed'
  };
  database.ref('books/' + id).update(updates);
}

// Return a book to its owner
function returnBook(id) {
  id = id.split('-')[1];
  $('#traded-' + id).remove();
  var updates = {
    borrower: '',
    request: 'none'
  };
  database.ref('books/' + id).update(updates);
}

// Print available books to page upon visit
database.ref('books/').once('value').then(function(snapshot) {
  for(var key in snapshot.val()) {
    if (snapshot.val().hasOwnProperty(key)) {
      var book = snapshot.val()[key];
      if(book.borrower === '') {
        $('.available').append('<a href="#" class="thumbnail book" id="available-' + key + '" onclick="requestBook(this.id)">'+
          '<img src="' + book.thumbnail + '" alt="' + book.title + '">'+
        '</a>');
      }
    }
  }
});
