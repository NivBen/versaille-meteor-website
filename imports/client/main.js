import { Accounts } from "meteor/accounts-base";
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';


//import 'imports/client/router.js';


// Will be true if Bootstrap 3-4 is loaded, false if Bootstrap 2 or no Bootstrap
var bootstrap_enabled = (typeof $().emulateTransitionEnd == 'function');
console.log(bootstrap_enabled)

/// infiniscroll
Session.set("imageLimit", 8);
lastScrollTop = 0;
$(window).scroll(function(event){
// test if we are near the bottom of the window
if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
  // where are we in the page?
  var scrollTop = $(this).scrollTop();
  // test if we are going down
  if (scrollTop > lastScrollTop){
    // yes we are heading down...
   Session.set("imageLimit", Session.get("imageLimit") + 4);
  }

  lastScrollTop = scrollTop;
}
})

/// accounts config
Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});

///
Template.images.helpers({
images:function(){
  if (Session.get("userFilter")){// they set a filter!
    return Images.find({createdBy:Session.get("userFilter")}, {sort:{createdOn: -1, rating:-1}});
  }
  else {
    return Images.find({}, {sort:{createdOn: -1, rating:-1}, limit:Session.get("imageLimit")});
  }
},
filtering_images:function(){
  if (Session.get("userFilter")){// they set a filter!
    return true;
  }
  else {
    return false;
  }
},
getFilterUser:function(){
  if (Session.get("userFilter")){// they set a filter!
    var user = Meteor.users.findOne(
      {_id:Session.get("userFilter")});
    return user.username;
  }
  else {
    return false;
  }
},
getUser:function(user_id){
  var user = Meteor.users.findOne({_id:user_id});
  if (user){
    return user.username;
  }
  else {
    return "anon";
  }
}
});

Template.body.helpers({username:function(){
if (Meteor.user()){
  return Meteor.user().username;
    //return Meteor.user().emails[0].address;
}
else {
  return "anonymous internet user";
}
}
});

Template.images.events({
'click .js-image':function(event){
    //$(event.target).css("width", "50px");
},
'click .js-del-image':function(event){
   var image_id = this._id;
   if (Meteor.user()){
     console.log("id of image quested for deletion: " + image_id);
     $('.confirm-delete').click(function() {
       $('#deleteModal').modal('hide');
       Images.remove({"_id":image_id});
       console.log("Deleted image of id: " + image_id);
     });
   } else{
     alert("Sign in to delete")
   }
},
'click .js-edit-image':function(event){
   var image_id = this._id;
   if (Meteor.user()){
     console.log("id of image quested for edit: " + image_id);
     $('.confirm-edit').click(function() {
       $('#editModal').modal('hide');
       alert("edited")
       console.log("Edited image of id: " + image_id);
       Images.update({_id:image_id},
                     {$set: {rating:rating}}); //TODO: change here
     });
   } else{
     alert("Sign in to delete")
   }
},
'click .js-rate-image':function(event){
  var rating = $(event.currentTarget).data("userrating");
  console.log(rating);
  var image_id = this.data_id;
  console.log(image_id);

  Images.update({_id:image_id},
                {$set: {rating:rating}});
},
'click .js-add_item_form':function(event){
    console.log("showing add item modal...");
  $("#add_item_form").modal('show');
},
'click .js-set-image-filter':function(event){
    Session.set("userFilter", this.createdBy);
},
'click .js-unset-image-filter':function(event){
    Session.set("userFilter", undefined);
},
});


Template.add_item_form.events({
'submit .js-add-item':function(event){
  var img_src, img_alt;

    img_src = event.target.img_src.value;
    img_alt = event.target.img_alt.value;
    console.log("src: "+img_src+" alt:"+img_alt);
    if (Meteor.user()){
      Images.insert({
        img_src:img_src,
        img_alt:img_alt,
        createdOn:new Date(),
        createdBy:Meteor.user()._id
      });
      console.log("added item")
  }
    $("#add_item_form").modal('hide');
 return false;
}
});
