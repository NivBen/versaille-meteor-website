import {Mongo} from 'meteor/mongo';
import {Meteor} from "meteor/meteor";
import {Accounts} from "meteor/accounts-base";

Accounts.config({
    forbidClientAccountCreation: true,
    loginExpirationInDays: 7
});

if (Meteor.isClient) {
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

Images = new Mongo.Collection('images');
ShoppingCart = new Mongo.Collection("cart");
// Easy-serach index
ImagesIndex = new EasySearch.Index({
    collection: Images,
    fields: ['watch_code_str'],
    engine: new EasySearch.MongoDB()
});

let is_admin_logged_in = function() {
    if(Meteor.user()) {
        return Meteor.user().username === "admin";
    } else{
        return false;
    }
}

let is_manager_logged_in = function() {
    if(Meteor.user()) {
        return Meteor.user().username === "David";
    } else{
        return false;
    }
}

let is_agent_logged_in = function() {
    return !!Meteor.user(); // TODO: change this to list of agents
}

// set up security on Images collection
if (Meteor.isServer) {
    Meteor.publish('images', function itemsPublication() {
        return Images.find();
    });

    var admin = 'admin'
    Images.allow({

        update: function (userId, doc) {
            return is_admin_logged_in() || is_manager_logged_in();
        },

        insert: function (userId, doc) {
            return is_admin_logged_in() || is_manager_logged_in();
        },

        remove: function (userId, doc) {
            return is_admin_logged_in() || is_manager_logged_in();
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
            return is_agent_logged_in();
        },
        insert: function (userId, doc) {
            return is_agent_logged_in();
        },
        remove: function (userId, doc) {
            return is_agent_logged_in();
        }
    })
}





Agents_PDF = new Mongo.Collection('agents_PDF');
// set up security on S3_images collection
if (Meteor.isServer) {
    Meteor.publish('agents_PDF', function () {
        return Agents_PDF.find();
    });

    Agents_PDF.allow({
        update: function () {
            return is_admin_logged_in() || is_manager_logged_in();
        },

        insert: function () {
            return is_admin_logged_in() || is_manager_logged_in();
        },

        remove: function () {
            return is_admin_logged_in() || is_manager_logged_in();
        }
    })
}
