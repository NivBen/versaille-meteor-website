import {Meteor} from 'meteor/meteor';
import '/imports/api/collections.js';
//import { Slingshot } from 'meteor/edgee:slingshot';

// ---- Startup function ----
Meteor.startup(function () {
    // creating admin and agents accounts
    if (Meteor.users.find().count() === 0) {
        Accounts.createUser({
            username: 'admin',
            password: Meteor.settings.user_default_password.admin_pass
        });
        Accounts.createUser({
            username: 'agent1',
            password: Meteor.settings.user_default_password.agent1_pass
        });
        Accounts.createUser({
            username: 'agent2',
            password: Meteor.settings.user_default_password.agent2_pass
        });
    }
    // setting up MAIL_URL
    let smtp = {
        username: Meteor.settings.smtp.username,
        password: Meteor.settings.smtp.password,
        server:   Meteor.settings.smtp.server,
        port: Meteor.settings.smtp.port
    }
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
});

Meteor.methods({
    // method to update cart on *single item* page
    server_single_item_update_cart : function(flag, opened_order, products_array_index, image_id, displayed_image_index) {
        let products_array = opened_order.products;
        if(products_array_index < 0) { // amount is 0 and not in cart
            if(flag === '+') {
                ShoppingCart.update({_id: opened_order._id},
                    {
                        $addToSet: {
                            products: image_id + '_' + displayed_image_index + '_1'
                        }
                    });
            } else { // flag === '-'
                // do nothing
            }
        } else { // amount > 0
            let new_amount = parseInt(products_array[products_array_index].split("_")[2]);
            if(flag === '+'){ new_amount = new_amount + 1; } else { new_amount = new_amount - 1; } // '-'
            let regex = new RegExp('^' + image_id + '_' + displayed_image_index, ''); // /^image_id_index/
            ShoppingCart.update( { _id: opened_order._id }, // pull (remove) element with old amount
                {
                    $pull: {
                        products: regex
                    }
                } )
            if(new_amount > 0) {
                ShoppingCart.update( { _id: opened_order._id }, // push element with new amount
                    {
                        $addToSet: {
                            products: image_id + '_' + displayed_image_index + '_' + new_amount
                        }
                    } )
            }
        }
    },
    // method to update cart on *single order* page
    server_single_order_update_cart : function(flag, opened_order, image_id, displayed_image_index, current_amount) {
        let products_array = opened_order.products;
        let new_amount = current_amount;
        if(flag === '+'){
            new_amount = new_amount + 1;
        } else { // '-'
            new_amount = new_amount - 1;
        }
        let regex = new RegExp('^' + image_id + '_' + displayed_image_index, ''); // /^image_id_index/
        ShoppingCart.update( { _id: opened_order._id }, // pull (remove) element with old amount
            {
                $pull: {
                    products: regex
                }
            } )
        if(new_amount > 0) {
            ShoppingCart.update( { _id: opened_order._id }, // push element with new amount
                {
                    $addToSet: {
                        products: image_id + '_' + displayed_image_index + '_' + new_amount
                    }
                } )
        }
    },

    server_close_order : function(order_id, agent_username, notes, hebrew_day) {
        let date = new Date();
        ShoppingCart.update({_id: order_id, username: agent_username},
            {
                $set: {
                    status: "closed",
                    notes: notes,
                    sent_date: new Date().toLocaleString("en-US", {timeZone: "Asia/Jerusalem", hour12: false }) + " " + hebrew_day,
                    sent_time: date.getTime()
                }
            },
            function(err, result) {
                if (err) {
                    console.log("ERROR CLOSING ORDER: " + err);
                }
            });
    },

    server_send_email(options) {
        // Make sure that all arguments are strings.
        //check([to, from, subject, text], [String]);

        // Let other method calls from the same client start running, without waiting for the email sending to complete.
        this.unblock();

        Email.send(options);
    }
});

function addZero(i) { // for date
    if (i < 10) { i = "0" + i; }
    return i;
}
