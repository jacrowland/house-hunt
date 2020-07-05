
const minBedSelector = document.querySelector("#minBed");
const maxBedSelector = document.querySelector("#maxBed");
const minBathSelector = document.querySelector("#minBath");
const maxBathSelector = document.querySelector("#maxBath");
const minPriceSelector = document.querySelector("#minPrice");
const maxPriceSelector = document.querySelector("#maxPrice");

minBedSelector.addEventListener('change',(e) => {
  if (maxBedSelector.value < minBedSelector.value) {
    maxBedSelector.selectedIndex = 0;
  }
});
maxBedSelector.addEventListener('change',(e) => {
  if (minBedSelector.value > maxBedSelector.value) {
    minBedSelector.selectedIndex = 0;
  }
});
minBathSelector.addEventListener('change',(e) => {
  if (maxBathSelector.value < minBathSelector.value) {
    maxBathSelector.selectedIndex = 0;
  }
});
maxBathSelector.addEventListener('change',(e) => {
  if (minBathSelector.value > maxBathSelector.value) {
    minBathSelector.selectedIndex = 0;
  }
});
minPriceSelector.addEventListener('change',(e) => {
  if (minPriceSelector.value > maxPriceSelector.value) {
    maxPriceSelector.selectedIndex = 0;
  }
});
maxPriceSelector.addEventListener('change',(e) => {
  if (maxPriceSelector.value < minPriceSelector.value) {
    minPriceSelector.selectedIndex = 0;
  }
});

// Retrieve property docs from properties collection
db.collection('properties').get().then(snapshot => { //replace .get() with .onSnapshot() for realtime version
  //Snapshot contains all the doc in a collection at a point in time
  setupProperties(snapshot.docs);
});

const propertiesList = document.querySelector("#searchResults");
const setupProperties = (data) => {
  propertiesList.innerHTML = "<div class='container'><h3> Results <small> this is what we found </small></h3><br></div>";
  var counter = 0;
  let card = null;
  data.forEach(async doc => {
    var cardID = "card" + counter++;
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
          <h5 class="card-title"><a class="text-dark" href="view.html?${doc.id}">${address}, ${property.suburb} </a></h5>
          <h6>${property.district}<small> ${property.region}</small></h6>
          <hr>
          <h6 style="color:rgba(56, 173, 169, 1);" class="card-subtitle mb-2"><strong>${property.tagline}</strong></h6>
          <h6 style="color:rgba(56, 173, 169, 1);" class="card-subtitle text-muted"><strong>${getMethodOfSaleString(property)}</strong></h6>
          <div class="row">
            <div class="container">
              <img style="height: 20px;"src="icons/toilet.svg" alt="bedroom icon">
              ${property.bedrooms}
              <img style="height: 20px;"src="icons/bed.svg" alt="bedroom icon">
              ${property.bathrooms}
            </div>
          </div>
          <hr>
          <p class="card-text">${property.description.substring(0, 70)}...</p>
          <hr>
          <div class="row">
            <div class="col-6">

            </div>
            <div class="col-6">
              <a href="#" class="float-right btn-lg btn-secondary card-link" >
                <small>${property.displayName}</small>
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
  var numSlides = maxSlides;
  if (maxSlides > imageURLS.length) {numslides = imageURLS.length}

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

// Returns the property doc id from the page url
// e.g view.html?abcd123 => abcd123
function getPropertyIDFromURL() {
  url = window.location.href ;
  url = url.split("?");
  return url.pop();
}

// Returns a string based on if the property has a second address line (i.e apartment floor etc.)
function getPropertyAddressString(property) {
  var address = property.address;
  if (property.address2 != "" && property.address2 != null) {
    address = property.address2 + ", " + address;
  }
  return address;
}

async function buildPropertyViewPage(id) {
  const propertyDocID = getPropertyIDFromURL();
  const doc = await getPropertyDoc(propertyDocID);
  const property = doc.data();
  const address = getPropertyAddressString(property);
  const imageURLS = await getImageURLS(property.images);
  const slides = getCarouselSlides(imageURLS, imageURLS.length);
  var main = document.querySelector("main");
  var propertyPath = document.querySelector("#propertyPath");
  var propertyAddressJumbotron = document.querySelector("#propertyAddressJumbotron");
  var indicators = "";

  document.title = address;

  for (var i = 0; i < imageURLS.length; i++) {
    if (i == 0) {
      indicators += `<li data-target='#viewPropertyCarousel' data-slide-to='${i}' class="active">`;
    }
    else {
      indicators += `<li data-target='#viewPropertyCarousel' data-slide-to='${i}' class="">`;
    }
  }

  propertyPath.innerHTML = `
  <div id="subNav" style="width: 100%;background-color: rgba(56, 173, 169, 1);">
    <div class="container text-light">
      <div class="row">
        <div class="col-md-9 col-lg-9 d-none d-md-block">
          <small id="path">
            <a href="residential.html">listings</a>  ${property.region} > ${property.district} > ${property.suburb}
          </small>
        </div>
        <div class="col-md-3 col-lg-3">
          <small id="path" class="mt-1 float-right">
            Listed on ${property.created.toDate().toString().substring(0, 15)}
          </small>
        </div>
      </div>
    </div>
  </div>
  `;

  propertyAddressJumbotron.innerHTML =`
  <div class="container">
    <h1 class="display-4 text-light text-left"> ${address}, ${property.suburb}</h1>
    <h2 class="display-5 text-light text-left"><small> ${property.district}, ${property.region}</small></h2>
  </div>`;

  var html = `
  <div id="viewPropertyCarousel" class="carousel slide mb-3" data-ride="carousel">
    <ol class="carousel-indicators">
      ${indicators}
    </ol>
    <div class="carousel-inner img-fluid">
      ${slides}
    </div>
    <a class="carousel-control-prev" href="#viewPropertyCarousel" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#viewPropertyCarousel" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>
  `;

  html += `
  <div id="viewPropertyContent" class="container col-md-10 float-left" style="margin-bottom: 150px;">
    <div class="container">
      <h2 style="color: rgba(56, 173, 169, 1);"> ${property.tagline} </h2>
      <h4 class="text-muted"> ${property.type} </h4>
      <h3 class=""> ${getMethodOfSaleString(property)}</h3>
    </div>
    <hr>
    <div class="container">
      <div class="row">
      <div class=" col">
        <img style="height: 20px;"src="icons/bed.svg" alt="bedroom icon">
        ${property.bedrooms} bedrooms

      </div>
      <div class=" col">
        <img style="height: 20px;"src="icons/toilet.svg" alt="bedroom icon">
        ${property.bathrooms} bathrooms
      </div>
      <div class=" col">
      <img style="height: 20px;"src="icons/fence.svg" alt="land area icon">
        ${property.landArea}m<sup>2</sup> land area
      </div>
      <div class=" col">
      <img style="height: 20px;"src="icons/floorarea.svg" alt="floor area icon">
        ${property.floorArea}m<sup>2</sup> floor area
      </div>
    </div>
    </div>
    <hr>
    <div class="container">
      <h3 class="text-muted"> Property details </h3>
      <p>
        ${property.description}
      </p>
    </div>
    <hr>
    <div class="container">
      <h3 class="text-muted"> Property features </h3>
      <div class="row">
        <div class="container col">
        <img style="height: 20px;"src="icons/garage.svg" alt="garage icon">
          ${property.garages} garages
        </div>
        <div class="container col">
        <img style="height: 20px;"src="icons/otherparks.svg" alt="car park icon">
           ${property.parks} other parks
        </div>
        <div class="container col">
        <img style="height: 20px;"src="icons/toilet.svg" alt="wcs icon">
          ${property.wcs} WCS
        </div>
        <div class="container col">
        <img style="height: 20px;"src="icons/stair.svg" alt="stairs icon">
          ${property.storeys} storeys
        </div>
      </div>
    </div>
    <hr>
    <div class="container text-muted">
      <div class="row text-center">
        <h6 class="col-sm-6"><span class="float-left">${doc.id}</span></h6>
        <h6 class="col-sm-6"><span class="float-right">Submitted by <a href="profile.html?${property.uid}">${property.displayName}</a></span></h6>
      </div>
    </div>
    <hr>
    `;

    // display a video if the property has one
    if (property.video != "" && property.video != null) {
      html += `
        <iframe width="560" height="315" src="${property.videoURL}"
        frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope;
        picture-in-picture" allowfullscreen></iframe>
      <hr>
        map
      <hr>
    `;
    }
  html += `</div>`;
  main.innerHTML = html;
}
