var displayNameInput;
var emailInput;
var userIDInput;
var updateProfileForm;
var currentUser;

async function getProfileDoc(uid) {
  var docRef = db.collection("users").doc(uid);
  var userDoc;
  await docRef.get().then((doc) => {
    userDoc = doc;
  }).catch((err) => {
    console.log(err.message);
  });
  return userDoc;
}

// takes a userID and returns all property doc with a matching UID field
async function getUserPropertyDocs(uid) {
  var userPropertyDocs;
  await db.collection('properties').where("user.uid", "==", uid).get().then(await function(querySnapshot) {
    userPropertyDocs = querySnapshot;
  });
  console.log(userPropertyDocs);
  return userPropertyDocs;
}

async function createProfile()  {
  const uid = getIDFromURL();
  const userDoc = await getProfileDoc(uid);
  var user = userDoc.data();
  const userPropertyDocs = await getUserPropertyDocs(uid);
  const main = document.querySelector("#main");
  var photoURL = await getUserProfileImageURL(user);
  var memberSince = user.created.toDate().toString().slice(4, 15);
  main.innerHTML = `
  <div class="align-content-center justify-content-center" >
    <form id="ProfileForm" class="row mt-3 mb-5 p-2 profile" >
          <div class="col-lg-4 col-md-6" style="text-align: center;">
            <img src="${photoURL}" style="border-radius:100%;height: 285px">
          </div>
          <div class="col-lg-8 col-md-6">
            <h3> Profile </h3>
            <label for="uid"> <small>UserID</small> </label>
            <input class="form-control" maxlength="50" type="text" value="${user.uid}" id="uid" disabled>
            <label for="displayName"><small>Display Name</small></label>
            <input class="form-control" value="${user.displayName}" id="displayName" disabled></input>
            <label for="memberSince"><small>Member Since</small></label>
            <input class="form-control" value="${memberSince}" id="memberSince" disabled></input>
            <br>
          </div>

    </form>
    <div id="searchResults">
      <!-- populated by displaySearchResults(docs) -->
    </div>
    <div style="height: 100px"></div>
  </div> <!-- /.row -->
  `
  displaySearchResults(userPropertyDocs);
}

createProfile();
