// we need to use the Mongo compoent
// so we need to import it
import {Mongo} from 'meteor/mongo';
import {Meteor} from "meteor/meteor";

Accounts.config({
    forbidClientAccountCreation: true,
    loginExpirationInDays: 7
});

Images = new Mongo.Collection('images');
ShoppingCart = new Mongo.Collection("cart");
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
                return Meteor.user().username === admin;
            } else {// user not logged in
                return false;
            }
        },

        insert: function (userId, doc) {
            if (Meteor.user()) {// logged in
                return Meteor.user().username === admin;
            } else {// user not logged in
                return false;
            }
        },

        remove: function (userId, doc) {
            if (Meteor.user()) {// logged in
                return Meteor.user().username === admin;
            } else {// user not logged in
                return false;
            }
        }
    })
}

// set up security on ShoppingCart collection
if (Meteor.isServer) {
    Meteor.publish('cart', function () {
        return ShoppingCart.find();
    });
    ShoppingCart.allow({
        update: function (userId, doc) {
            return !!Meteor.user();
        },
        insert: function (userId, doc) {
            return !!Meteor.user();
        },
        remove: function (userId, doc) {
            return !!Meteor.user();
        }
    })
}
