// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyA3KQyWF_9HGQu0EjbKLmgSyhFOGaeQW_A",
  authDomain: "house-hunt-e5549.firebaseapp.com",
  databaseURL: "https://house-hunt-e5549.firebaseio.com",
  projectId: "house-hunt-e5549",
  storageBucket: "house-hunt-e5549.appspot.com",
  messagingSenderId: "797134028334",
  appId: "1:797134028334:web:b2ed37b00a4396e38729bf",
  measurementId: "G-P3WCB18JL7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
// Make auth & firestore references
var storage = firebase.storage();
const auth = firebase.auth();
const google = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();

// Gets a list of regions from the 'regions' collection on firestore
async function getRegionList() {
  var regionList = [];
  var snapshot = await db.collection("regions").get();
  await snapshot.forEach(async (doc) => {
    region = await doc.data();
    regionList.push(region);
  });
  return regionList;
}

// Gets a list of districts of a region, given a region, from the 'regions' collection on firestore
async function getDistrictsList(region) {
  var districtList = [];
  var snapshot = await db.collection("regions").where('name', '==', region).get();
  await snapshot.forEach(async (doc) => {
    region = await doc.data();
    // Gets array of districts
    districts = region.districts;
    districts.forEach((district) => {
      districtList.push(district.name);
    });
  });
  return districtList;
}

// Gets a list of suburbs of a district from a region, given a region and district, from the 'regions' collection on firestore
async function getSuburbsList(region, district) {
  var suburbsList = [];
  snapshot = await db.collection("regions").where('name', '==', region).get();
  await snapshot.forEach(async (doc) => {
    region = await doc.data();
    districts = region.districts;
    districts.forEach((d) => {
      if (d.name == district) {
        d.suburbs.forEach((suburb) => {
            suburbsList.push(suburb);
        });
      }
    });
  });
  return suburbsList;
}

// Adds contextually appropriate options to the Region, City/Town/District and Suburb/Area selectors of a search form
async function populateSearchSelector(selector, selectedRegion, selectedDistrict) {
  var html = "";
  var regions = null;
  var districts = null;
  var suburbs = null;

  // Populate the selector with regions
  if (selectedRegion == null && selectedDistrict == null) {
    regions = await getRegionList();
    html = "<option value=''>Any region</option>";
    regions.forEach((region) => {
      html += `<option value="${region.name}">${region.name}</option>`;
    });
  }
  // Populate the selector with cities/towns/districts
  else {
    districts = await getDistrictsList(selectedRegion);
    // Get city/town/districts of a selected REGION
    if (selectedRegion != null && selectedDistrict == null) {
      html = "<option value=''>Any district</option>";
      districts.forEach((district) => {
        html += `<option value="${district}">${district}</option>`;
      });
    }
    // Populate the selector with suburbs based on citis/town/district and region
    else if (selectedRegion != null && selectedDistrict != null) {
      suburbs = await getSuburbsList(selectedRegion, selectedDistrict);
      html = "<option value=''>Any suburb</option>";
      suburbs.forEach((suburb) => {
        html += `<option value="${suburb}">${suburb}</option>`;
      });
    }
  }
  selector.innerHTML = html;
}

// Takes as input an array of firebase storage and returns an array of usable URLS for <img src="...">
async function getImageURLS(imageArray) {
  var imageURLS = []
  slides = await Promise.all(imageArray.map(async (image) => {
    var urlToAdd = null;
    // Create a reference from a Google Cloud Storage URL
    var storageRef = storage.ref();
    var gsReference = storageRef.child(image);
    //var gsReference = storage.ref(image);
    await gsReference.getDownloadURL().then(function(url) {
      urlToAdd = url;
    }).catch((err) => {
      console.log(err.message);
    });
    imageURLS.push(urlToAdd);
  })).then(() => {
    //console.log(imageURLS);
    // NEED TO RESTRUCTURE THIS
    //slides = getCarouselSlides(imageURLS);
    //return slides;
    return imageURLS;
  });
  //console.log(slides);
  //return slides;
  return imageURLS;
}

// Takes as input a doc from the properties collection and returns a string of the method of sale or the price is property.advertisedPrice is TRUE
function getMethodOfSaleString(property) {
  // auction, negotiation, tender, advertisedPrice, poa
  var method = "";
  if (property.methodOfSale.buy.buy == true) {
    if (property.methodOfSale.buy.auction) {
      method = "Auction";
    }
    else if (property.methodOfSale.buy.negotiation) {
      method = "Negotiation";
    }
    else if (property.methodOfSale.buy.tender) {
      method = "Tender";
    }
    else if (property.methodOfSale.buy.poa) {
      method = "POA";
    }
    else if (property.methodOfSale.buy.advertisedPrice) {
      method = "$" + property.price;
    }
  }
  else if (property.methodOfSale.rent.rent == true) {
    // TODO: add period weekly, fornightly etc.
    method = "$" + property.methodOfSale.rent.rentAmount + " per ...";
  }
  return method;
}

async function setupUI(user) {
  await buildNav(user);
  setActiveNav(window.location.href.split("/").pop());
  var loggedInElements = document.getElementsByClassName("logged-in");
  var loggedOutElements = document.getElementsByClassName("logged-out");
  // Hides all elements with logged-in class if the user is logged out
  // and shows the logged-in elements (and vice-versa).
  if (user) {
    for (var i = 0; i < loggedInElements.length; i++) loggedInElements[i].style.display = "";
    for (var i = 0; i < loggedOutElements.length; i++) loggedOutElements[i].style.display = "none";
  }
  else if (!user) {
    for (var i = 0; i < loggedInElements.length; i++) loggedInElements[i].style.display = "none";
    for (var i = 0; i < loggedOutElements.length; i++) loggedOutElements[i].style.display = "";
  }

}

function setActiveNav(path) {
  if (path == "index.html") {
    // Set current page as active in nav
    var homePageLink = document.querySelector("#homePageLink");
    homePageLink.classList.add("active");
  } else if (path == "residential.html") {
    // Set current page as active in nav
    var residentialPageLink = document.querySelector("#residentialPageLink");
    residentialPageLink.classList.add("active");
  } else if (path == "commercial.html") {
    var commercialPageLink = document.querySelector("#commercialPageLink");
    commercialPageLink.classList.add("active");
  } else if (path == "about.html") {
    var aboutPageLink = document.querySelector("#aboutPageLink");
    aboutPageLink.classList.add("active");
  }
}

async function getUserProfileImageURL(user) {
  var userProfileImageURL = null;
  try {
    var gsReference = storage.ref(user.photoURL);
    await gsReference.getDownloadURL().then(function(url) {
      userProfileImageURL = url;
    });
  } catch(err) {
    // if err, return a placeholder profile picture url
    userProfileImageURL = "images/profile_image.png";
  }
  return userProfileImageURL;
}

async function buildNav(user) {
  if (!user) {
    user = {
      displayName: "null",
    }
  }
  profileImageURL = await getUserProfileImageURL(user);
  const navbar = document.getElementById('navbar');
  navbar.innerHTML = `
  <div class="container">
  <a class="navbar-brand" href="index.html">
     <img src="images/house_hunt_logo_white.png" height='40px'  alt="house hunt logo">
  </a>
  <button class="navbar-toggler navbar-dark" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item d-md-block d-sm-none" id="homePageLink">
        <a class="nav-link" href="index.html">Home <span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item" id="residentialPageLink">
        <a class="nav-link" href="residential.html">Residential</a>
      </li>
      <li class="nav-item" id="commercialPageLink">
        <a class="nav-link" href="commercial.html">Commercial</a>
      </li>
      <li class="nav-item" id="commercialPageLink">
        <a class="nav-link" href="about.html">About</a>
      </li>
    </ul>
    <div id="navbar-quickactions">
      <!-- populated by options depending on if user is logged in or not -->
      <div class="btn-group logged-in">
        <button type="button" class="btn btn-sm btn-user dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <small id="usernameDropdownText">${user.displayName}</small>
          <img src="${profileImageURL}" style="border-radius: 100%; margin-top:-4px;height: 30px;width:30px;">
        </button>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="dashboard.html">
          <svg style="margin-top: -3px" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-grid-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
          </svg>
          Dashboard</a>
          <a class="dropdown-item" href="dashboard.html">
            <svg style="margin-top: -3px" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-house-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8 3.293l6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
              <path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
            </svg>
            My Properties
          </a>
          <a class="dropdown-item" href="dashboard.html">
            <svg style="margin-top: -3px" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-star-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
            </svg>
            Saved Properties
          </a>
          <a class="dropdown-item" href="profile.html?${user.uid}">
          <svg style="margin-top: -3px" width="1em" height="1em"  viewBox="0 0 16 16" class="bi bi-person-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path fill-rule="evenodd" d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
            Profile
          </a>
          <a class="dropdown-item" href="updateprofile.html?${user.uid}">
          <svg style="margin-top: -3px" width="1em" height="1em" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
          </svg>
            Edit Profile
          </a>
          <a class="dropdown-item" href="submitproperty.html">
          <svg style="margin-top: -3px" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-upload" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M.5 8a.5.5 0 0 1 .5.5V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5a.5.5 0 0 1 1 0V12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8.5A.5.5 0 0 1 .5 8zM5 4.854a.5.5 0 0 0 .707 0L8 2.56l2.293 2.293A.5.5 0 1 0 11 4.146L8.354 1.5a.5.5 0 0 0-.708 0L5 4.146a.5.5 0 0 0 0 .708z"/>
            <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8A.5.5 0 0 1 8 2z"/>
          </svg>
            Submit Property
          </a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" onclick="logout()" id="logoutBtn">
          <svg style="margin-top: -3px" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-door-closed-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M4 1a1 1 0 0 0-1 1v13H1.5a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2a1 1 0 0 0-1-1H4zm2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
          Logout
          </a>
        </div>
      </div>
      <a href="login.html" id="loginBtn"  class="logged-out btn btn-sm btn-user"> <small>Login</small>
          <svg style="margin-top: -4px" width="0.9em" height="0.9em" viewBox="0 0 16 16" class="bi bi-door-open" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M1 15.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zM11.5 2H11V1h.5A1.5 1.5 0 0 1 13 2.5V15h-1V2.5a.5.5 0 0 0-.5-.5z"/>
            <path fill-rule="evenodd" d="M10.828.122A.5.5 0 0 1 11 .5V15h-1V1.077l-6 .857V15H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117z"/>
            <path d="M8 9c0 .552.224 1 .5 1s.5-.448.5-1-.224-1-.5-1-.5.448-.5 1z"/>
          </svg>
        </a>
    </div>
  </div>
  </div>
  `;
}

function filePickerChangeEvent(e) {
  // Displays chosen files to the user
  filePickerLabelString = "";
  for (i = 0; i < filePicker.files.length;i++) {
    filePickerLabelString += filePicker.files[i].name + " ";
  }
  filePickerLabel.innerText = filePickerLabelString;
}

const regionSelector = document.querySelector("#region");
const districtSelector = document.querySelector("#district");
const suburbSelecter = document.querySelector("#suburb");
var filePicker = document.querySelector('#imageFilePicker');
var filePickerLabel = document.querySelector(".custom-file-label");
// Updates the text on filePicker to the name(s) of the file(s) chosen
if (filePicker != null) {filePicker.addEventListener('change', (e) => {filePickerChangeEvent(e);});}
if (regionSelector != null && districtSelector != null) {
  regionSelector.addEventListener('change', async (e) => {
    await populateSearchSelector(districtSelector, regionSelector.value);
    suburbSelecter.innerHTML = "<option value=''>Any suburb</option>";
    suburbSelecter.disabled = true;
    districtSelector.disabled = false;
  });
  districtSelector.addEventListener('change', async (e) => {
    await populateSearchSelector(suburbSelecter, regionSelector.value, districtSelector.value);
    if (districtSelector.value == "") {
      suburbSelecter.disabled = true;
    }
    else {
      suburbSelecter.disabled = false;
    }
  });
}

// Returns the doc id from the page url
// e.g view.html?abcd123 => abcd123
function getIDFromURL() {
  url = window.location.href;
  url = url.split("?");
  return url.pop();
}

const displaySearchResults = (snapshot) => {
  const propertiesList = document.querySelector("#searchResults");
  propertiesList.innerHTML = `<div class='container'><h2> Results <small> Our hunters found ${snapshot.size} result(s) </small></h2><br></div>`;
  let card = null;
  snapshot.forEach(async doc => {
    var cardID = doc.id;
    // retrieve content from doc
    const property = doc.data();
    var imageURLS = await getImageURLS(property.images);
    var slides = getCarouselSlides(imageURLS, 3);
    var address = getPropertyAddressString(property);

    card = `
    <div class="mb-3 card col-xl-8 col-lg-12 col-md-12 propertyResultCard">
      <div class="row">
        <div class="col-md-6 col-sm-12 pl-0 pr-0">
          <div id="${cardID}" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner">
              ${slides}
            </div>
            <a class="carousel-control-prev" href="#${cardID}" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#${cardID}" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>
        <div class="card-body col-md-6 col-sm-12">
          <h5 class="card-title"><a class="text-dark" href="view.html?${doc.id}">${address}, ${property.location.suburb} </a></h5>
          <h6>${property.location.district}<small> ${property.location.region}</small></h6>
          <hr>
          <h6 style="color:rgba(56, 173, 169, 1);" class="card-subtitle mb-2"><strong>${property.tagline}</strong></h6>
          <h6 style="color:rgba(56, 173, 169, 1);" class="card-subtitle text-muted"><strong>${getMethodOfSaleString(property)}</strong></h6>
          <div class="row">
            <div class="container">
              <img style="height: 20px;"src="icons/toilet.svg" alt="bedroom icon">
              ${property.details.bedrooms}
              <img style="height: 20px;"src="icons/bed.svg" alt="bedroom icon">
              ${property.details.bathrooms}
            </div>
          </div>
          <hr>
          <p class="card-text">${property.description.substring(0, 70)}...</p>
          <hr>
          <div class="row">
            <div class="col">
              <a href="view.html?${doc.id}" class="w-100 btn btn-primary btn-lg"><small>View more</small></a>
            </div>
            <div class="col">
              <a href="profile.html?${property.user.uid}" class="float-right btn-lg btn-secondary card-link" >
                <small>${property.user.displayName}</small>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- card -->
    `
    //console.log(card);
    propertiesList.innerHTML += card
  });
   propertiesList.style.display = "";
}

// Takes array of web urls for images and returns html for bootstrap carousel-item
function getCarouselSlides(imageURLS, maxSlides) {
  var html = "";
  var numSlides = 1;
  if (maxSlides > imageURLS.length) {
    numSlides = imageURLS.length;
  }
  else {
    numSlides = maxSlides;
  }

  for (i = 0; i < numSlides; i++) {
    if (i == 0) {
      html += `<div class="carousel-item active">`
    }
    else {
      html += `<div class="carousel-item">`
    }
    html += `
      <img style="" class="d-block" src="${imageURLS[i]}">
    </div>
    `;
  }
  return html;
}

// Given an id return the property doc
async function getPropertyDoc(id) {
  var docRef = db.collection("properties").doc(id);
  var propertyDoc;
  await docRef.get().then(function(doc) {
    propertyDoc = doc;
  }).catch((err)=> {
    console.log(err.message);
  });
  return propertyDoc;
}

// Returns a string based on if the property has a second address line (i.e apartment floor etc.)
function getPropertyAddressString(property) {
  var address = property.location.address;
  if (property.location.address2 != "" && property.location.address2 != null) {
    address = property.location.address2 + ", " + address;
  }
  return address;
}


function main() {
  setupUI();
  try {
    populateSearchSelector(regionSelector);
  } catch (err) {}
}

main();
