// this is the entry point for the client application that runs
// in the web browser, so we import all the bits the client application needs

// import the templates and css
import '/imports/client/image_share.css';
import '/imports/client/image_share.html';


// import the code that defines the collections
import '/imports/api/collections.js';
// import the main client code (routes, helpers, events etc.)
// you might want to separate those things into separate files...
import '/imports/client/main.js';
