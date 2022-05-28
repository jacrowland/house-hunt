const dashboardPageContent = document.querySelector("#dashboardPageContent");
const dashboardPageJumbotron = document.querySelector("#dashboardPageJumbotron");

function setupDashboard(user) {
  dashboardPageJumbotron.innerHTML = `<h1 class="text-center display-4"> Welcome, ${user.displayName}. </h1>`;
  dashboardPageContent.innerHTML = `<em>Under construction</em>`
}

function buildSubmitPropertyForm() {
  dashboardPageContent.innerHTML = "submit property";
  dashboardPageJumbotron.innerHTML = `<h1 class="text-center display-4"> Submit Property </h1>`;
}

async function buildManageProperties() {
  dashboardPageJumbotron.innerHTML = `<h1 class="text-center display-4"> Manage Properties </h1>`;
  userPropertyDocs = await getUserPropertyDocs(await firebase.auth().currentUser.uid);
  var table = `
  <table class="table">
    <thead>
      <tr>
        <th scope="col">Property ID</th>
        <th scope="col">Address</th>
        <th scope="col">Suburb</th>
        <th scope="col">Region</th>
        <th scope="col">Submitted</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
  `
  userPropertyDocs.forEach((doc) => {
    const property = doc.data();
    table += `
    <tr>
      <th scope="row">${doc.id}</th>
      <td>${property.location.address}</td>
      <td>${property.location.suburb}</td>
      <td>${property.location.region}</td>
      <td>${property.created.toDate().toString().substring(0, 15)}</td>
      <td>
        <button type="button" class="btn btn-success">Edit</button>
        <button type="button" class="btn btn-danger">Delete</button>
      </td>
    </a>
    </tr>
    `;
  });
  table.innerHTML += `
  </tbody>
  </table>
  `;

  dashboardPageContent.innerHTML = table;

}

function buildSavedProperties() {
  dashboardPageContent.innerHTML = "my favourites";
  dashboardPageJumbotron.innerHTML = `<h1 class="text-center display-4"> Saved Properties </h1>`;
}

async function buildEditProfile() {
  var user = firebase.auth().currentUser;
  var photoURL = await getUserProfileImageURL(user);
  dashboardPageJumbotron.innerHTML = `<h1 class="text-center display-4"> Edit Profile </h1>`;
  dashboardPageContent.innerHTML = `
    <form id="updateProfileForm" class="p-3 col-md-12 mb-5">
          <img src="${photoURL}" class="mb-3" style="height: 200px">
          <div class="custom-file" >
            <small> Update Profile Picture </small>
            <input accept=".jpeg, .jpg, .png" type="file" class="custom-file-input" id="imageFilePicker">
            <label style="overflow:hidden;" class="custom-file-label" for="customFile">Choose file</label>
          </div>
          <label for="uid"> <small>UserID</small> </label>
          <input class="form-control" maxlength="50" type="text" value="${user.uid}" id="uid" disabled>
          <label for="displayName"><small>Display Name</small></label>
          <input class="form-control" maxlength="10" value="${user.displayName}" id="displayName"></input>
          <label for="email"><small>Email Address</small></label>
          <input class="form-control" value="${user.email}" id="email"></input>
          <br>
          <button type="submit" class="btn btn-block btn-primary"> Update </button>
    </form>
  `
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
      // if user has selected a new profile photo
      if (filePicker.files.length > 0) {
        var path = await updateProfilePicture(filePicker.files, user);
        await db.collection("users").doc(user.uid).update({
          photoURL: path,
        }).then(() => {}).catch((err) => {console.log(err);});
      }
      await db.collection("users").doc(user.uid).update({
        displayName: displayNameInput.value,
      }).then(() => {
      }).catch((err) => {
        console.log(err);
      });
      location.reload();
    });
  });


  return;
}
