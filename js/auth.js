const signUpForm = document.querySelector("#signUpForm");
const loginForm = document.querySelector("#loginForm");
const resetPasswordForm = document.querySelector("#resetPasswordForm");
const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");
const backToLoginBtn = document.querySelector("#backToLoginBtn");
const goToSignUpFormBtn = document.querySelector("#goToSignUpFormBtn");
const GoogleSignInBtn = document.querySelector("#GoogleSignInBtn");

// Listen for Auth status changes
auth.onAuthStateChanged(user => {
    setupUI(user);
  });

// logout the user
function logout() {
  auth.signOut();
  window.location = "index.html";
}

try {
  //  User Login & Reset Password Page
  forgotPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetPasswordForm.style.display = "";
    loginForm.style.display = "none";
    signUpForm.style.display = "none";
  });
  goToSignUpFormBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signUpForm.style.display = "";
    resetPasswordForm.style.display = "none";
    loginForm.style.display = "none";
  })

  // Login the user
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    auth.signInWithEmailAndPassword(email, password).then(cred => {
      console.log(cred.user);
      console.log("The user has logged in successfully!");
      loginForm.reset();
      window.location = "index.html";
    }).catch(function(err) {
      console.log(err.message);
    })
  });

  // Send reset password email
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailAddress = resetPasswordForm['resetEmail'].value;
    console.log(emailAddress);
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      const alertSuccess = document.querySelector(".alert-success");
      alertSuccess.style.display = "";
    }).catch(function(error) {
      const alertSuccess = document.querySelector(".alert-danger");
      alertSuccess.style.display = "";
    });
  });

  //  Sign up the user
  signUpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // must be a properly formatted email
    const email = signUpForm['signUpEmail'].value;
    // password must be > 6
    const password = signUpForm['signUpPassword'].value;

    auth.createUserWithEmailAndPassword(email, password).then(function(cred) {
      firebase.auth().currentUser.updateProfile({
        // Sets the user's displayName using the value provided
        displayName:  signUpForm['displayName'].value,
      }).then(function() {
        // Update successful.
      }).catch(function(error) {
        // An error happened.
      });
      signUpForm.reset();
    });
  });

  // Sign in the user with a Google Account
  GoogleSignInBtn.addEventListener("click", (e) => {
    e.preventDefault();
    firebase.auth().signInWithRedirect(google);
    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
      }
      // The signed-in user info.
      var user = result.user;
      window.location = "index.html";
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log(errorMessage);
    });
  });
}
catch(err) {
  // An error occurred
}
