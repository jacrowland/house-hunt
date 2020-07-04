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
  if (property.auction) {
    method = "Auction";
  }
  else if (property.negotiation) {
    method = "Negotiation";
  }
  else if (property.tender) {
    method = "Tender";
  }
  else if (property.poa) {
    method = "POA";
  }
  else if (property.advertisedPrice) {
    method = "$" + property.price;
  }
  return method;
}

function setupAuthUI(user) {
  const navbarQuickActions = document.getElementById("navbar-quickactions");
  // If the user is logged in a dropdown menu is displayed
  if (user) {
    var photoURL = null;
      //getUserProfileImage();
      try {
        var gsReference = storage.refFromURL(user.photoURL);
        gsReference.getDownloadURL().then(function(url) {
          photoURL = url;
        });
      } catch(err) {
        photoURL = "images/profile_image.png";
      }
    navbarQuickActions.innerHTML = `
    <div class="btn-group">
      <button type="button" class="btn btn-sm btn-user dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <small id="usernameDropdownText">${user.displayName}</small>
        <img src="${photoURL}" style="margin-top:-4px;height: 30px;">
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
    `;
  }
  // If the user is logged out a login button is displayed
  else {
    navbarQuickActions.innerHTML = `
    <a href="login.html" id="loginBtn"  class="btn btn-sm btn-user"> <small>Login</small>
    <svg style="margin-top: -4px" width="0.9em" height="0.9em" viewBox="0 0 16 16" class="bi bi-door-open" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M1 15.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zM11.5 2H11V1h.5A1.5 1.5 0 0 1 13 2.5V15h-1V2.5a.5.5 0 0 0-.5-.5z"/>
      <path fill-rule="evenodd" d="M10.828.122A.5.5 0 0 1 11 .5V15h-1V1.077l-6 .857V15H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117z"/>
      <path d="M8 9c0 .552.224 1 .5 1s.5-.448.5-1-.224-1-.5-1-.5.448-.5 1z"/>
    </svg>
  </a>
    `;
  }
}

function buildNav() {
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
    </div>
  </div>
  </div>
  `;
}

const regionSelector = document.querySelector("#region");
const districtSelector = document.querySelector("#district");
const suburbSelecter = document.querySelector("#suburb");
if (regionSelector != null && districtSelector != null) {
  regionSelector.addEventListener('change', async (e) => {
    await populateSearchSelector(districtSelector, regionSelector.value);
    suburbSelecter.innerHTML = "<option value=''>Any suburb</option>";
    suburbSelecter.disabled = true;
    districtSelector.disabled = false;
  });
  districtSelector.addEventListener('change', async (e) => {
    await populateSearchSelector(suburbSelecter, regionSelector.value, districtSelector.value);
    suburbSelecter.disabled = false;
  });
}

function main() {
  buildNav();
  populateSearchSelector(regionSelector);
}

main();
