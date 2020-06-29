import {Meteor} from 'meteor/meteor';
import '/imports/api/collections.js';
//import { Slingshot } from 'meteor/edgee:slingshot';

// ---- Startup function ----
Meteor.startup(function () {
    // creating admin account
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
});

Meteor.methods({
    server_update_cart : function(flag, opened_order, products_array_index, image_id, displayed_image_index) {
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
            ShoppingCart.update( { _id: opened_order._id }, // pull element with old amount
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
    }
});
