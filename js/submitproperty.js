const filePicker = document.querySelector('#imageFilePicker');
const filePickerLabel = document.querySelector(".custom-file-label");

// Updates the text on filePicker to the name(s) of the file(s) chosen
filePicker.addEventListener('change', (e) => {
  // Displays chosen files to the user
  filePickerLabelString = "";
  for (i = 0; i < filePicker.files.length;i++) {
    filePickerLabelString += filePicker.files[i].name + " ";
  }
  filePickerLabel.innerText = filePickerLabelString;
});

// Submits a property to the firestore
const submitResidentialPropertyForm = document.querySelector("#submitResidentialPropertyForm");
submitResidentialPropertyForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // Method of sale (either true or false)
  const advertisedPrice = document.querySelector("#advertisedPriceRadioBtn").checked;                                      
  const negotiation = document.querySelector("#negotiationRadioBtn").checked;
  const tender = document.querySelector("#tenderRadioBtn").checked;
  const auction = document.querySelector("#auctionRadioBtn").checked;
  const poaRadioBtn = document.querySelector("#poaRadioBtn").checked;

db.collection('properties').add({
      uid: firebase.auth().currentUser.uid,
      displayName: firebase.auth().currentUser.displayName,
      created: firebase.firestore.Timestamp.now(),
      type: 'Residential',
      buy: true,
      rent: false,

      tagline: submitResidentialPropertyForm['tagline'].value,
      description: submitResidentialPropertyForm['description'].value,
      address: submitResidentialPropertyForm['address'].value,
      address2: submitResidentialPropertyForm['address2'].value,
      district: submitResidentialPropertyForm['district'].value,
      region: submitResidentialPropertyForm['region'].value,
      suburb: submitResidentialPropertyForm['suburb'].value,

      titleType: submitResidentialPropertyForm['titleType'].value,

      auction: auction,
      poa: poaRadioBtn,
      tender: tender,
      negotiation: negotiation,
      advertisedPrice: advertisedPrice,
      price: submitResidentialPropertyForm['price'].value,

      bedrooms: submitResidentialPropertyForm['bed'].value,
      bathrooms: submitResidentialPropertyForm['bath'].value,
      garages: submitResidentialPropertyForm['garage'].value,
      parks: submitResidentialPropertyForm['parks'].value,

      wcs: submitResidentialPropertyForm['wcs'].value,
      storeys: submitResidentialPropertyForm['storeys'].value,
      landArea: submitResidentialPropertyForm['landArea'].value,
      floorArea: submitResidentialPropertyForm['floorArea'].value,
      ensuites: submitResidentialPropertyForm['ensuites'].value,
      images: []

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
