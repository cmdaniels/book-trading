var provider = new firebase.auth.TwitterAuthProvider();
var loggedIn = false;
var userId;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    loggedIn = true;
    userId = user.uid;
    $('#login').html('Sign Out');
  } else {
    loggedIn = false;
    $('#login').html('Log In with Twitter <i class="fa fa-twitter" aria-hidden="true"></i>');
  }
});

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
