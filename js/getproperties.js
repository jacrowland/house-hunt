
// Retrieve property docs from properties collection
db.collection('properties').get().then(snapshot => { //replace .get() with .onSnapshot() for realtime version
  //Snapshot contains all the doc in a collection at a point in time
  displaySearchResults(snapshot);
});

async function buildPropertyViewPage(id) {
  const propertyDocID = getIDFromURL();
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
            <a href="residential.html">listings</a> > ${property.location.region} > ${property.location.district} > ${property.location.suburb}
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
    <h1 class="display-4 text-light text-left"> ${address}, ${property.location.suburb}</h1>
    <h2 class="display-5 text-light text-left"><small> ${property.location.district}, ${property.location.region}</small></h2>
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
      <h4 class="text-muted"> Residential</h4>
      <h3 class=""> ${getMethodOfSaleString(property)}</h3>
    </div>
    <hr>
    <div class="container">
      <div class="row">
      <div class=" col">
        <img style="height: 20px;"src="icons/bed.svg" alt="bedroom icon">
        ${property.details.bedrooms} bedrooms

      </div>
      <div class=" col">
        <img style="height: 20px;"src="icons/toilet.svg" alt="bedroom icon">
        ${property.details.bathrooms} bathrooms
      </div>
      <div class=" col">
      <img style="height: 20px;"src="icons/fence.svg" alt="land area icon">
        ${property.details.landArea}m<sup>2</sup> land area
      </div>
      <div class=" col">
      <img style="height: 20px;"src="icons/floorarea.svg" alt="floor area icon">
        ${property.details.floorArea}m<sup>2</sup> floor area
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
          ${property.details.garages} garages
        </div>
        <div class="container col">
        <img style="height: 20px;"src="icons/otherparks.svg" alt="car park icon">
           ${property.details.parks} other parks
        </div>
        <div class="container col">
        <img style="height: 20px;"src="icons/toilet.svg" alt="wcs icon">
          ${property.details.wcs} WCS
        </div>
        <div class="container col">
        <img style="height: 20px;"src="icons/stair.svg" alt="stairs icon">
          ${property.details.storeys} storeys
        </div>
      </div>
    </div>
    <hr>
    <div class="container text-muted">
      <div class="row text-center">
        <h6 class="col-sm-6"><span class="float-left">${doc.id}</span></h6>
        <h6 class="col-sm-6"><span class="float-right">Submitted by <a href="profile.html?${property.user.uid}">${property.user.displayName}</a></span></h6>
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

const searchResidentialPropertiesForm = document.querySelector("#searchResidentialPropertiesForm");

// Search collections using a custom built query
searchResidentialPropertiesForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const region = searchResidentialPropertiesForm['region'].value;
  const district = searchResidentialPropertiesForm['district'].value;
  const suburb = searchResidentialPropertiesForm['suburb'].value;
  const buyOrRent = searchResidentialPropertiesForm['buyOrRent'].value;
  var buy = false;
  var rent = false;
  if (buyOrRent == "Buy") buy=true;
  if (buyOrRent == "Rent") rent=true;
  //console.log([buyOrRent, region, district, suburb, minBath, maxBath, minBed, maxBed, minPrice, maxPrice]);

  // Building query based on user input
  var propertiesRef = db.collection("properties");
  console.log(buy);
  if (region == "" && district == "" && suburb == "") {
    query = propertiesRef.where("methodOfSale.buy.buy", "==", buy).where("methodOfSale.rent.rent", "==", rent);
  }
  else if (region != "" && district == "" && suburb == "") {
    console.log("region query");
    query = propertiesRef.where("methodOfSale.buy.buy", "==", buy).where("methodOfSale.rent.rent", "==", rent).where("location.region", "==", region);
  }
  else if (region != "" && district != "" && suburb == "") {
    query = propertiesRef.where("methodOfSale.buy.buy", "==", buy).where("methodOfSale.rent.rent", "==", rent).where("location.region", "==", region).where("location.district", "==", district);
  }
  else if (region != "" && district != "" && suburb != "") {
    query = propertiesRef.where("methodOfSale.buy.buy", "==", buy).where("methodOfSale.rent.rent", "==", rent).where("location.region", "==", region).where("location.district", "==", district).where("location.suburb", "==", suburb);
  }
  else {
    query = propertiesRef;
  }

  // Retrieve properties matching the query
  query.get().then((querySnapshot) => {
    console.log(querySnapshot);
    displaySearchResults(querySnapshot);
    querySnapshot.forEach((doc) => {
      console.log(doc.data());
    });
  }).catch((err) => {
    console.log(err.message);
  });
})
