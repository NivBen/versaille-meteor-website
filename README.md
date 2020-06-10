Meteor based website for Versaille Watches LTD 

Currently deployed at http://versaille.eu.meteorapp.com/

**Notes:**

### Dumping catalog data:
#### backing up one collection
mongodump --forceTableScan -h 127.0.0.1 --port 3001 -d meteor -c images

mongorestore -h 127.0.0.1 --port 3001 -d meteor dump/meteor/images.bson -c images

#### on windows
mongodump --forceTableScan -h 127.0.0.1 --port 3001 -d meteor -c images

mongorestore -h 127.0.0.1 --port 3001 -d meteor C:\Users\<user>\WebstormProjects\versaille0.08\dump\meteor\images.bson -c images




___
BUG list:

() load more items button jumps to beginning of page

() MAJOR: tinyMCE - mainly just upsert issue(should upsert on server startup.js), 
			 also for some reason doesn't always show up	 

() MINOR: adding item form saves values from store to store (submit does not clean the form for the next input)

() MINOR: on small enough displays the mini cards on single item are vertically aligned

() MINOR: catalog and single item only works with absolute URLs and not local files in public folder

___
Nice to have:

() increase font and images height on small displays

() add similar item links

() move carousel images to s3 for quicker load

() contact page

() diplay thumbnails instead of full photo for speed
	probably just make a thumbnail version for each photo
___
versaille0.08 updates:
* Fixed Bug:
	can't access single item direct link (for example http://localhost:3000/catalog_item/gQ3RuZjyuBuK3PsNa)
	shows Images.findOne() is undefined when directly accessed and not through link
	
* removed footer from catalog and search (overlapping with sidebar)

* Favicon did not working

* google drive /file/d/ shareable links now convert to <img src="..."> format

* MAJOR: after a few runs, google links stop working 403 error (probably too many requests)
	fixed by using aws s3 instead
