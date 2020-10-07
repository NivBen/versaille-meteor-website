import {Meteor} from 'meteor/meteor';
import '/imports/api/collections.js';
import { AWS } from 'meteor/peerlibrary:aws-sdk';

// ---- Startup function ----
Meteor.startup(function () {
    // creating admin and agents accounts
    if (Meteor.users.find().count() === 0) {
        Accounts.createUser({
            username: 'admin',
            password: Meteor.settings.user_default_password.admin_pass
        });
        Accounts.createUser({
            username: 'David',
            password: Meteor.settings.user_default_password.agent1_pass
        });
        Accounts.createUser({
            username: 'Itzik',
            password: Meteor.settings.user_default_password.agent2_pass
        });
        Accounts.createUser({
            username: 'Bentzi',
            password: Meteor.settings.user_default_password.agent3_pass
        });
    }
    // setting up MAIL_URL
    let smtp = {
        username: Meteor.settings.smtp.username,
        password: Meteor.settings.smtp.password,
        server:   Meteor.settings.smtp.server,
        port: Meteor.settings.smtp.port
    }
    // '?tls.rejectUnauthorized=false' to fix 'Error: self signed certificate in certificate chain'
    // according to https://forums.meteor.com/t/email-messages-cant-be-sent/38188/10
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port + '?tls.rejectUnauthorized=false';
});

// ---- Meteor Methods ----
Meteor.methods({
    // method to update cart on *single item* page
    server_single_item_update_cart : function(flag, opened_order, products_array_index, image_id, displayed_image_index) {
        let products_array = opened_order.products;
        if(products_array_index < 0) { // amount is 0 and not in cart
            if(flag === '+') {
                AgentCart.update({_id: opened_order._id},
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
            AgentCart.update( { _id: opened_order._id }, // pull (remove) element with old amount
                {
                    $pull: {
                        products: regex
                    }
                } )
            if(new_amount > 0) {
                AgentCart.update( { _id: opened_order._id }, // push element with new amount
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
        AgentCart.update( { _id: opened_order._id }, // pull (remove) element with old amount
            {
                $pull: {
                    products: regex
                }
            } )
        if(new_amount > 0) {
            AgentCart.update( { _id: opened_order._id }, // push element with new amount
                {
                    $addToSet: {
                        products: image_id + '_' + displayed_image_index + '_' + new_amount
                    }
                } )
        }
    },
    // method to close order *single order* page
    server_close_order : function(order_id, agent_username, notes) {
        AgentCart.update({_id: order_id, username: agent_username},
            {
                $set: {
                    status: "closed",
                    notes: notes,
                    sent_date: getJerusalemDate() + " " + getHebrewDay(),
                    sent_time: Date.now()
                }
            },
            function(err, result) {
                if (err) {
                    console.log("ERROR CLOSING ORDER: " + err);
                }
            });
    },
    // method to send email
    server_send_email(options) {
        // Let other method calls from the same client start running, without waiting for the email sending to complete.
        this.unblock();
        Email.send(options);
    },
    // method to delete s3 item given an object url
    delete_s3_item: function(object_url) {
        if (is_admin_logged_in() || is_manager_logged_in()) {
            AWS.config.update({
                accessKeyId: Meteor.settings.S3_Delete_credentials.AWSAccessKeyId,
                secretAccessKey: Meteor.settings.S3_Delete_credentials.AWSSecretAccessKey,
                region: Meteor.settings.S3_Delete_credentials.region
            });
            var s3 = new AWS.S3();
            let key = object_url.replace("https://" + Meteor.settings.S3_Delete_credentials.bucket + ".s3." + Meteor.settings.S3_Delete_credentials.region + ".amazonaws.com/", '');
            key = object_url.replace("https://" + Meteor.settings.S3_Delete_credentials.bucket + ".s3-" + Meteor.settings.S3_Delete_credentials.region + ".amazonaws.com/", '');
            var params = {
                Bucket: Meteor.settings.S3_Delete_credentials.bucket,
                Key: key
            }; // key is the path to the object
            var deleteObject = Meteor.wrapAsync(s3.deleteObject(params, function (error, data) {
                if (error) {
                    console.log('ERROR in S3 delete:' + error);
                } else {
                    console.log('Successful S3 delete of the following key: ' + key);
                    console.log(data);
                }
            }));
        }
    },
});

// ---- Helper functions ----
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
    let verified_agents = ["admin", "manager", "agent"];
    if(Meteor.userId()) {
        return verified_agents.includes(Meteor.users.findOne(Meteor.userId()).role);
    } else {
        return false;
    }
}

function getJerusalemDate() { // returns date in jerusalem in the following format: "dd.mm.yy, hh:mm"
    let date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jerusalem",
        hour12: false, timeStyle: "short", dateStyle: "short"
    })
    return (date.split('/')[1] + '.' + date.split('/')[0] + '.' + date.split('/')[2]);
}

function getHebrewDay() { // returns string containing the current hebrew day
    switch ((new Date()).getDay()) { // day to hebrew
        case 0: return 'ראשון';
        case 1: return 'שני';
        case 2: return 'שלישי';
        case 3: return 'רביעי';
        case 4: return 'חמישי';
        case 5: return 'שישי';
        case 6: return 'שבת';
    }
}

// ---- AWS S3 handling ----
Slingshot.fileRestrictions("pdfUploads", {
    allowedFileTypes: ["application/pdf"],
    maxSize: 30 * 1024 * 1024 // 30 MB (null for unlimited)
});

Slingshot.createDirective("pdfUploads", Slingshot.S3Storage, {
    AWSAccessKeyId: Meteor.settings.S3_credentials.AWSAccessKeyId,
    AWSSecretAccessKey: Meteor.settings.S3_credentials.AWSSecretAccessKey,
    bucket: Meteor.settings.S3_credentials.bucket,
    acl: "public-read",
    region: Meteor.settings.S3_credentials.region,

    authorize: function () {
        if (is_admin_logged_in() || is_manager_logged_in()) {
            return true;
        } else {
            let message = "Attempted S3 pdf file upload without permission";
            console.log("ERROR:" + message);
            throw new Meteor.Error("Login Required", message);
        }
    },

    // How To Modifying The Filename Before Uploading
    // https://stackoverflow.com/questions/42610307/how-to-modifying-the-filename-before-uploading-when-using-meteor-edgeeslingshot
    key: function (file, metacontext) {
        return "PDFs" + "/" + metacontext.agent + '/' + file.name;
    }

});

export let temp = 'hello';
