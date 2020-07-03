Meteor based website for Versaille Watches LTD 

Currently deployed at https://www.versaille.co.il

___
BUG list:
() MAJOR: order screen does not overflow on small displays - buttons unreachable

() MAJOR: removed tinyMCE for the time being
			tinyMCE - mainly just upsert issue(should upsert on server startup.js), 
			 also for some reason doesn't always show up - probably local run issue	 

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
versaille0.09 updates:
* Fixed Bug:
	can't access single item direct link (for example /catalog_item/gQ3RuZjyuBuK3PsNa)
	shows Images.findOne() is undefined when directly accessed and not through link
	
* removed footer from catalog and search (overlapping with sidebar)

* Favicon did not working

* google drive /file/d/ shareable links now convert to <img src="..."> format

* MAJOR: after a few runs, google links stop working 403 error (probably too many requests)
	fixed by using aws s3 instead
	
* increase logo on mobile

* increase font and images height on small displays

* navbar bottom margin is bad on mobile

* js-load-more jumps to start of page

* price range slider

* add order functionality
