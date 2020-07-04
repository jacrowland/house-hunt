
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

    var address = property.address;
    if (property.address2 != "" && property.address2 != null) {
      address = property.address2 + ", " + address;
    }

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
          <h5 class="card-title">${address}, ${property.suburb} </h5>
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
      <img style="height: 350px" class="d-block" src="${imageURLS[i]}">
    </div>
    `;
  }
  return html;
}


populateSearchSelector(regionSelector);
