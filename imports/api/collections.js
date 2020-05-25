// we need to use the Mongo compoent
// so we need to import it
import {Mongo} from 'meteor/mongo';

Accounts.config({
    forbidClientAccountCreation: true
});

Images = new Mongo.Collection('images');
PagesText = new Mongo.Collection('pages_text');
// Easy-serach index
ImagesIndex = new EasySearch.Index({
    collection: Images,
    fields: ['watch_code_str'],
    engine: new EasySearch.MongoDB()
});


// set up security on Images collection
if (Meteor.isServer) {
    Meteor.publish('images', function itemsPublication() {
        return Images.find();
    });

    var admin = 'admin'
    Images.allow({

        update: function (userId, doc) {
            if (Meteor.user()) {// logged in
                if (Meteor.user().username == admin) {
                    return true;
                } else {
                    return false;
                }
            } else {// user not logged in
                return false;
            }
        },

        insert: function (userId, doc) {
            if (Meteor.user()) {// logged in
                if (Meteor.user().username == admin) {
                    return true;
                } else {
                    return false;
                }
            } else {// user not logged in
                console.log("ha ha")
                return false;
            }
        },

        remove: function (userId, doc) {
            if (Meteor.user()) {// logged in
                if (Meteor.user().username == admin) {
                    return true;
                } else {
                    return false;
                }
            } else {// user not logged in
                return false;
            }
        }
    })
}


if (Meteor.isServer) {
    Meteor.publish('pages_text', function () {
        return PagesText.find();
    });
    var admin = "admin";
    PagesText.allow({

        update: function (userId, doc) {
            if (Meteor.user()) {// logged in
                if (Meteor.user().username == admin) {
                    return true;
                } else {
                    return false;
                }
            } else {// user not logged in
                return false;
            }
        },

        insert: function (userId, doc) {
            if (Meteor.user()) {// logged in
                if (Meteor.user().username == admin) {
                    return true;
                } else {
                    return false;
                }
            } else {// user not logged in
                return false;
            }
        },

        remove: function (userId, doc) {
            if (Meteor.user()) {// logged in
                if (Meteor.user().username == admin) {
                    return true;
                } else {
                    return false;
                }
            } else {// user not logged in
                return false;
            }
        }
    })
}
