var displayNameInput;
var emailInput;
var userIDInput;
var updateProfileForm;
var currentUser;

// Listen for Auth status changes
auth.onAuthStateChanged(async function(user) {
    if (user) {
      currentUser = user;
      await createUpdateProfileForm(user);
      updateProfileForm = document.querySelector("#updateProfileForm");
      displayNameInput = document.querySelector("#displayName");
      userIDInput = document.querySelector("#uid");
      emailInput = document.querySelector("#email");
      filePicker = document.querySelector("#imageFilePicker");
      filePickerLabel = document.querySelector(".custom-file-label");
      filePicker.addEventListener('change', (e) => {filePickerChangeEvent(e);});

      updateProfileForm.addEventListener("submit", e => {
        e.preventDefault();
        user.updateProfile({
          displayName: displayNameInput.value,
          email: emailInput.value
        }).then(async function(){
          if (filePicker.files.length > 0) await updateProfilePicture(filePicker.files, currentUser);
          location.reload();
        });
      });
    }
  });

async function createUpdateProfileForm(user){
  const main = document.querySelector("#main");
  var photoURL = await getUserProfileImageURL(user);
  main.innerHTML = `
  <div class="row align-content-center justify-content-center">
    <form id="updateProfileForm" class="col-sm-5">
          <img src="${photoURL}" class="mb-3" style="height: 200px">
          <div class="custom-file" >
            <small> Update Profile Picture </small>
            <input accept=".jpeg, .jpg, .png" type="file" class="custom-file-input" id="imageFilePicker">
            <label style="overflow:hidden;" class="custom-file-label" for="customFile">Choose file</label>
          </div>
          <label for="uid"> <small>UserID</small> </label>
          <input class="form-control" maxlength="50" type="text" value="${user.uid}" id="uid" disabled>
          <label for="displayName"><small>Display Name</small></label>
          <input class="form-control" value="${user.displayName}" id="displayName"></input>
          <label for="email"><small>Email Address</small></label>
          <input class="form-control" value="${user.email}" id="email"></input>
          <br>
          <button type="submit" class="btn btn-block btn-primary"> Update </button>
    </form>
  </div> <!-- /.row -->
  `
  return;
}

async function updateProfilePicture(files, user) {
  const file = files[0];
  const fileType = file.name.split('.').pop();
  var imageName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const path = user.uid + "/" + "profile" + "/" + imageName;
  const storageRef = firebase.storage().ref(path);
  const res = await storageRef.put(file).then(async function(snapshot) {
    console.log("Success! " + file.name + " has been uploaded.");
    await user.updateProfile({
      photoURL: path
    }).then(() => {
      console.log(path);
      console.log("Successfully updated the user's profile picture");
    }).catch((err) => {
      console.log(err.message); //failed to set profileURL
    });
  }).catch((err) => {
    console.log(err.message); //failed to upload image
  });
}
