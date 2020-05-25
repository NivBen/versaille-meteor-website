Meteor based website for Versaille Watches LTD 

**Notes:**

### Dumping catalog data:
#### backing up one collection
mongodump --forceTableScan -h 127.0.0.1 --port 3001 -d meteor -c images

mongorestore -h 127.0.0.1 --port 3001 -d meteor dump/meteor/images.bson -c images

#### on windows
mongodump --forceTableScan -h 127.0.0.1 --port 3001 -d meteor -c images

mongorestore -h 127.0.0.1 --port 3001 -d meteor C:\Users\<user>\WebstormProjects\versaille0.07\dump\meteor\images.bson -c images




___
BUG list:

() adding item form saves values from store to store (submit does not clean the form for the next input)

() can't access single item direct link (for example http://localhost:3000/catalog_item/gQ3RuZjyuBuK3PsNa)
	shows Images.findOne() is undefined when directly accessed and not through link

() on small enough displays the mini cards on single item are vertically aligned

() catalog and  single item only works with absolute URLs and not local files in public folder

() tinyMCE - mainly just upsert issue(should upsert on server startup.js), 
			 also for some reason doesn't always show up