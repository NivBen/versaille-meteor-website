import { Meteor } from 'meteor/meteor';
import '/imports/api/collections.js';

Meteor.startup(function(){
	if (Images.find().count() == 0){
		for (var i=1;i<23;i++){
			Images.insert(
				{
					img_src:"img_"+i+".jpg",
					watch_code: (Math.floor(Math.random() * 33) + 10)*100,
					watch_price: Math.floor(Math.random() * 1001),
					watch_category: Math.floor(Math.random() * 4),
					watch_description: Math.random().toString(36).substring(7)
				}
			);
		}// end of for insert images
		// count the images!
		console.log("startup.js says: "+Images.find().count());
	}// end of if have no images

	if (Meteor.users.find().count() == 0){
		var admin_id = Accounts.createUser({
	    username    : 'admin',
	    password    : '123456'
		});
		console.log("creating admin account with id: " + admin_id);
	}

});
