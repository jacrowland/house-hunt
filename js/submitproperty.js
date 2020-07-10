// Submits a property to the firestore
const submitResidentialPropertyForm = document.querySelector("#submitResidentialPropertyForm");
submitResidentialPropertyForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var buy = false;
  var rent = false;
  // For Purchase Properties
  var titleType = null;
  var advertisedPrice = false;
  var negotiation = false;
  var tender = false;
  var auction = false;
  var poa = false;
  var price = null;
  // For Rental Properties
  var rentFrequency = document.querySelector("rentFrequency");
  var rentAmount = null;
  var weekly = false;
  var monthly = false;
  var fortnightly = false;
  var annually = false;

  buyOrRent = document.querySelector("#buyOrRent");
  if (buyOrRent.value == "buy") {
    buy = true;
    advertisedPrice = document.querySelector("#advertisedPriceRadioBtn").checked;
    negotiation = document.querySelector("#negotiationRadioBtn").checked;
    tender = document.querySelector("#tenderRadioBtn").checked;
    auction = document.querySelector("#auctionRadioBtn").checked;
    poa = document.querySelector("#poaRadioBtn").checked;
    if (advertisedPrice) {
      price = submitResidentialPropertyForm['price'].value
    }
  }
  else if (buyOrRent.value == "rent") {
    rent = true;
    rentAmount = document.querySelector("#rentAmount").value;
    weekly = document.querySelector("#weeklyRadioBtn").checked;
    monthly = document.querySelector("#monthlyRadioBtn").checked;
    fortnightly = document.querySelector("#fornightlyRadioBtn").checked;
    annually = document.querySelector("#annuallyRadioBtn").checked
  }

db.collection('properties').add({
      created: firebase.firestore.Timestamp.now(),
      location: {
        address: submitResidentialPropertyForm['address'].value,
        address2: submitResidentialPropertyForm['address2'].value,
        region: submitResidentialPropertyForm['region'].value,
        district: submitResidentialPropertyForm['district'].value,
        suburb: submitResidentialPropertyForm['suburb'].value
      },
      images: [],
      videoURL: null,
      methodOfSale: {
        buy: {
          buy: buy,
          auction: auction,
          poa: poa,
          tender: tender,
          negotiation: negotiation,
          advertisedPrice: advertisedPrice,
          price: price,
        },
        rent: {
          rent: rent,
          rentAmount: rentAmount,
          weekly: weekly,
          fortnightly: fortnightly,
          monthly: monthly,
          annually: annually
        }
      },
      tagline: submitResidentialPropertyForm['tagline'].value,
      description: submitResidentialPropertyForm['description'].value,
      user: {
        displayName: firebase.auth().currentUser.displayName,
        uid: firebase.auth().currentUser.uid
      },
      details: {
        residential: true,
        commercial: false,
        title: submitResidentialPropertyForm['titleType'].value,
        bedrooms: submitResidentialPropertyForm['bed'].value,
        bathrooms: submitResidentialPropertyForm['bath'].value,
        ensuites: submitResidentialPropertyForm['ensuites'].value,
        wcs: submitResidentialPropertyForm['wcs'].value,
        garages: submitResidentialPropertyForm['garage'].value,
        parks: submitResidentialPropertyForm['parks'].value,
        landArea: submitResidentialPropertyForm['landArea'].value,
        floorArea: submitResidentialPropertyForm['floorArea'].value,
        storeys: submitResidentialPropertyForm['storeys'].value,
        }
    }).then(function(docRef){
      var imagesArray = [];
      uploadImages(filePicker.files, docRef.id, imagesArray);
      submitResidentialPropertyForm.reset();
    }).catch(err => {
      // An error occurred
    });
});

// Uploads all submitted images and then updates the images array on the property property doc
const uploadImages = async (files, propertyID, imagesArray) => {
  Promise.all(Array.from(files).map(async (file) => {
    // Get the path to store the image
    // Generate random string name
    const fileType = file.name.split('.').pop();
    var imageName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    imageName = imageName + "." + fileType;
    const path = firebase.auth().currentUser.uid + "/" + propertyID +  "/" + imageName;
    const storageRef = firebase.storage().ref(path);
    const res = await storageRef.put(file).then(function(snapshot) {
      console.log("Success! " + file.name + " has been uploaded.");
      imagesArray.push(path);
    });
  })).then(() => {
    updateImagesArray(imagesArray, propertyID);
  });
}

// Updates the property doc's image array with given array
function updateImagesArray(imagesArray, propertyID) {
  console.log(imagesArray);
  // update property image array to path of each image
  db.collection('properties').doc(propertyID).set({
    images: imagesArray
  }, { merge: true } );
}
