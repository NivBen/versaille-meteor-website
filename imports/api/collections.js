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

// Security fix - Deny users modification
Meteor.users.deny({
    update: function() {
        return true;
    }
});

// global user role functions
is_not_logged_in = function() {
    if(Meteor.user()) {
        return false;
    } else{
        return true;
    }
}
is_admin_logged_in = function() {
    if(Meteor.user()) {
        return Meteor.user().username === "admin";
    } else{
        return false;
    }
}
is_manager_logged_in = function() {
    if(Meteor.user()) {
        return Meteor.user().username === "David";
    } else{
        return false;
    }
}
is_agent_logged_in = function() {
    let verified_agents = ["admin", "manager", "agent"];
    if(Meteor.userId()) {
        return verified_agents.includes(Meteor.users.findOne(Meteor.userId()).role);
    } else {
        return false;
    }
}

// global collection variables
Agents_PDF = new Mongo.Collection('agents_PDF');
Images = new Mongo.Collection('images');
AgentCart = new Mongo.Collection("cart");
// Easy-serach index
ImagesIndex = new EasySearch.Index({
    collection: Images,
    fields: ['watch_code_str'],
    engine: new EasySearch.MongoDB()
});

// publishing a limited users collection containing _id, username and role
if (Meteor.isServer) {
    Meteor.publish('roles', function rolePublication() {
        return Meteor.users.find({}, {fields: {username: 1, role: 1}});
    });
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

// set up security on AgentCart collection
if (Meteor.isServer) {
    Meteor.publish('cart', function () {
        return AgentCart.find();
    });
    AgentCart.allow({
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
