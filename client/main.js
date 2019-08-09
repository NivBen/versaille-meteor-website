// this is the entry point for the client application that runs
// in the web browser, so we import all the bits the client application needs

// import the templates and css
import '/imports/client/main.css';
import '/imports/client/main.html';
import '/imports/client/catalog.html';
import '/imports/client/aboutpage.html';
import '/imports/client/navbar.html';
import '/imports/client/footer.html';

import '/imports/client/image_modal.html'; // testing area

// import the code that defines the collections
import '/imports/api/collections.js';
// import the main client code (routes, helpers, events etc.)
// you might want to separate those things into separate files...
import '/imports/client/main.js';
import '/imports/client/router.js';
