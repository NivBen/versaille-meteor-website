import {Accounts} from "meteor/accounts-base";
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
//import { Slingshot } from 'meteor/edgee:slingshot';

Template.registerHelper('and',(a,b)=>{
    return a && b;
});
Template.registerHelper('or',(a,b)=>{
    return a || b;
});

/// infiniscroll for catalog items
let imageLimit = 16; // TODO: maybe limit this differently
Session.set("imageLimit", imageLimit);
let catalogLastScrollTop = 0;

$(window).scroll(function (event) {
    if(window.location.pathname === "/catalog") {
        // test if we are near the bottom of the window
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            // where are we in the page?
            var scrollTop = $(this).scrollTop();
            // test if we are going down
            if (scrollTop > catalogLastScrollTop) {
                // yes we are heading down...
                Session.set("imageLimit", Session.get("imageLimit") + imageLimit / 2);
            }
            catalogLastScrollTop = scrollTop;
        }
    }
})

let ordersLimit = 10;
Session.set("ordersLimit", ordersLimit);
let ordersLastScrollTop = 0;
$(window).scroll(function (event) {
    if(window.location.pathname === "/orders") {
        // test if we are near the bottom of the window
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            // where are we in the page?
            var scrollTop = $(this).scrollTop();
            // test if we are going down
            if (scrollTop > ordersLastScrollTop) {
                // yes we are heading down...
                Session.set("ordersLimit", Session.get("ordersLimit") + ordersLimit / 2);
            }
            ordersLastScrollTop = scrollTop;
        }
    }
})

let sender_email = Meteor.settings.public.sender_email;
let email_recipient_list = Meteor.settings.public.email_recipient_list;
$('.carousel').carousel({
    pause: false,
    interval: "500",
})

// treating popstate events (back button, refresh, etc...)
$(window).on('popstate', function(event) {
    // trick to return to last scroll position
    if(window.location.pathname === "/catalog") {
        setTimeout(function () {
            window.scrollTo(0, Session.get("last_scroll_position"));
        },100);
    }

    // Bug fix - popstate like back button did not remove modal backdrop
    $('.modal').modal('hide') // closes all active pop ups.
    $('.modal-backdrop').remove() // removes the grey overlay.
    $('body').removeClass('modal-open');
});

// START ---- local helper functions ----
let is_item_on_sale = function(item_id) {
    let on_sale = Images.findOne({_id: item_id}).on_sale_price;
    if(on_sale !== null) { // if not null
        return on_sale > 0; // if positive
    }

    return false;
}

let is_item_not_on_sale = function(item_id) {
    return !is_item_on_sale(item_id);
}

let single_item_update_cart = function(image_id, flag) {
    let opened_order = AgentCart.findOne({username: Meteor.user().username, status: "open"});
    if (opened_order){
        let displayed_image_index = Session.get("cart_quested_item_index");
        let products_array = opened_order.products;
        let products_array_index = find_product_index(products_array, image_id, displayed_image_index);
        Meteor.call('server_single_item_update_cart', flag, opened_order, products_array_index, image_id, displayed_image_index);
    } else {
        alert("לא קיימת הזמנה פתוחה");
    }
}

let single_order_update_cart = function(id_index_amount_array, flag) {
    let opened_order = AgentCart.findOne({username: Meteor.user().username, status: "open"});
    if (opened_order){
        let image_id = id_index_amount_array[0];
        let displayed_image_index = id_index_amount_array[1];
        let current_amount = parseInt(id_index_amount_array[2]);
        Meteor.call('server_single_order_update_cart', flag, opened_order, image_id, displayed_image_index, current_amount);
    } else {
        alert("לא קיימת הזמנה פתוחה");
    }
}

let is_there_an_order_in_place = function() {
    return AgentCart.find({username: Meteor.user().username , status: "open"}).count() > 0;
}

let find_product_index = function(products_array, image_id, index){
    let values;
    for (let i = 0; i < products_array.length; i++) {
        values = products_array[i].split("_");
        if(values[0] === image_id && values[1] == index) {
            return i;
        }
    }
    return -1; // not found
}

let email_template_new_products_format = function(opened_order) {
    let products = opened_order.products;
    let new_products_format = [], total_amount = 0, total_price = 0;
    let image, displayed_image_index, values=[]; // helpers
    let img_url = "", watch_code, watch_desc, amount = 0, price = 0; // per watch elements
    for(let i=0; i<products.length; i++){
        values = products[i].split("_");
        image = Images.findOne({ _id: values[0] }); // image JSON
        displayed_image_index = values[1];
        amount = parseInt(values[2]);
        price = parseInt(image.watch_price);
        watch_code = parseInt(image.watch_code);
        // Retrieve URL and Description
        switch(parseInt(displayed_image_index)) {
            case 1:
                img_url = convert_full_size_to_thumbnail_link(image.img_src);
                watch_desc = image.first_img_desc
                break;
            case 2:
                img_url = convert_full_size_to_thumbnail_link(image.second_img_src);
                watch_desc = image.second_img_desc
                break;
            case 3:
                img_url = convert_full_size_to_thumbnail_link(image.third_img_src);
                watch_desc = image.third_img_desc
                break;
            case 4:
                img_url = convert_full_size_to_thumbnail_link(image.forth_img_src);
                watch_desc = image.forth_img_desc
                break;
            case 5:
                img_url = convert_full_size_to_thumbnail_link(image.fifth_img_src);
                watch_desc = image.fifth_img_desc
                break;
        }

        new_products_format.push({
            img_url: img_url,
            watch_code: watch_code,
            watch_desc: watch_desc,
            amount: amount,
            price: price
        });
        total_amount = total_amount + amount;
        total_price = total_price + (amount * price);
    }
    return [new_products_format, total_amount, total_price];
}

// converts an s3 full size link from versaillewatches bucket to thumbnail version from versaillewatches-resized bucket
// (such as "https://versaillewatches.s3.eu-central-1.amazonaws.com/3800/3807_1.jpg"
// to "https://versaillewatches-resized.s3.eu-central-1.amazonaws.com/resized-3800/3807_1.jpg")
let convert_full_size_to_thumbnail_link = function(full_sized_image_link){
    let thumbnail_link = full_sized_image_link.replace("versaillewatches", "versaillewatches-resized"); // update bucket
    let link_suffix = full_sized_image_link.replace(/(^https:\/\/[^\/]+\/)/g, '').split('/'); // link suffix ("3800/3807_1.jpg")
    let folder_name = link_suffix[0], file_name = link_suffix[1];
    let link_prefix = thumbnail_link.split(/(^https:\/\/[^\/]+\/)/g)[1];
    thumbnail_link = link_prefix + 'resized-' + folder_name + '/' + file_name;
    return thumbnail_link
}

function getJerusalemDate() { // returns date in jerusalem in the following format: "dd.mm.yy, hh:mm" ()
    let date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jerusalem",
        hour12: false, timeStyle: "short", dateStyle: "short"
    })
    return (date.split('/')[1] + '.' + date.split('/')[0] + '.' + date.split('/')[2]);
}

function getHebrewDay() { // returns string containing the current hebrew day
    switch ((new Date()).getDay()) {
        case 0: return 'ראשון';
        case 1: return 'שני';
        case 2: return 'שלישי';
        case 3: return 'רביעי';
        case 4: return 'חמישי';
        case 5: return 'שישי';
        case 6: return 'שבת';
    }
}
// END ---- local helper functions ----

Template.searchBox.onCreated(function bodyOnCreated() {
    Meteor.subscribe('images');
});

Template.main_Layout.onCreated(function bodyOnCreated() {
    Meteor.subscribe('roles');
    Meteor.subscribe('images');
    Meteor.subscribe('agents_PDF');
    Meteor.subscribe('cart');
});

// Start ---- Login ----
Template.login.created = function(){
    // attach a reactive var to the template instance to change button to loading icon
    this.loading_attempted_login = new ReactiveVar(false);
    this.wrong_login_credentials = new ReactiveVar(false);
};

Template.login.helpers({
    loading_attempted_login: function(){
        // return the value of the reactive var attached to this template instance
        return Template.instance().loading_attempted_login.get();
    },
    wrong_login_credentials: function(){
        // return the value of the reactive var attached to this template instance
        return Template.instance().wrong_login_credentials.get();
    }
});

Template.login.events({
    'submit form': function(event, tmpl){
        event.preventDefault();
        tmpl.wrong_login_credentials.set(false);
        tmpl.loading_attempted_login.set(true);

        //setTimeout(() => { // TODO: remove
        let input_username_or_email = event.target.inputUser.value;
        let input_password = event.target.loginInputPassword.value;
        Meteor.loginWithPassword(input_username_or_email, input_password, function(error){
            tmpl.loading_attempted_login.set(false);
            if(error){
                let reason = error.reason;
                if(reason === "Incorrect password" || reason === "User not found"){
                    tmpl.wrong_login_credentials.set(true);
                }
            } else {
                // stay on the same page, template changed to "logged in"
            }
        });
        //}, 1000);
    },
    'click .js-logout': function(event){
        event.preventDefault();
        let btn = document.getElementById("btn-logout");
        btn.innerHTML = '<i class=\"fa fa-circle-o-notch fa-spin fa-4x\"></i>...מתנתק';
        btn.classList.remove("btn-danger-round-ends");
        btn.classList.add("btn-light")
        btn.disabled = true;
        Meteor.logout();
    },
    'click #forgot_pswd': function(event){
        event.preventDefault();
        alert("השירות אינו זמין כעת...");
    },
    'click #btn-signup': function(event){
        event.preventDefault();
        alert("השירות אינו זמין כעת...");
    }
});

Template.changePassword.created = function(){
    // attach a reactive var to the template instance to change button to loading icon
    this.changed_password = new ReactiveVar(false);
};

Template.changePassword.helpers({
    changed_password: function(){
        return Template.instance().changed_password.get();
    }
});

Template.changePassword.events({
    'submit form': function(event, tmpl){
        event.preventDefault();
        tmpl.changed_password.set(true);
        let current_password = event.target.loginPassword.value;
        let new_password = event.target.new_password.value;
        let new_password_repeat = event.target.new_password_repeat.value;
        let password_regex = new RegExp("^((?=.*[a-zA-Z])(?=.*[0-9]))(?=.{8,16})\\w+");
        if(!password_regex.test(new_password) || !password_regex.test(new_password_repeat)) {
            alert("הסיסמא חייבת להיות באורך 8 תווים לפחות ו-16 לכל היותר, ולהכיל אות אחת וספרה אחת");
            return false;
        }
        if(new_password === new_password_repeat) {
                Accounts.changePassword(current_password, new_password, function (error) {
                    tmpl.changed_password.set(false);
                    if (error) {
                        alert("סיסמא שגויה");
                    } else {
                        alert("הסיסמא שונתה בהצלחה!");
                        Router.go('/login')
                    }
                });
        } else {
            alert("סיסמא חדשה לא תואמת")
        }
    }
});
// Start ---- Login ----

// Start ---- CATALOG ----
Template.catalog.helpers({
    getUser: function (user_id) {
        let user = Meteor.users.findOne({_id: user_id});
        if (user) {
            return user.username;
        } else {
            return "anon";
        }
    },
    getThumbnailImgLink: function() {
        return convert_full_size_to_thumbnail_link(this.img_src);
    },
    getImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getFirstImgDesc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).first_img_desc;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getSecondImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).second_img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getSecondImgDesc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).second_img_desc;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getThirdImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).third_img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getThirdImgDesc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).third_img_desc;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getForthImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).forth_img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getForthImgDesc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).forth_img_desc;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getFifthImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).fifth_img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getFifthImgDesc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).fifth_img_desc;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getWatchCode: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).watch_code;
        } catch (e) {
        }
    },
    getWatchPrice: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).watch_price;
        } catch (e) {
        }
    },
    getOnSalePrice: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).on_sale_price;
        } catch (e) {
        }
    },
    getWatchDescription: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).watch_description;
        } catch (e) {
        }
    },
});

Template.catalog.events({
    'click .js-del-image': function (event) {
        var image_id = this._id;
        if (is_admin_logged_in()) {
            $('.confirm-delete').click(function () {
                $('#delete_' +
                    '').modal('hide');
                Images.remove({"_id": image_id});
                $("#delete_item_modal").modal('hide');
            });
        } else {
            alert("Sign in to delete")
        }
    },
    'click .js-edit_item_button': function (event) {
        Session.set("item_id_to_edit", this._id);
        $("#edit_item_modal").modal('hide');
    },
    'submit .js-edit-item': function (event) {
        var item_id = Session.get("item_id_to_edit");
        var img_src, second_img_src, third_img_src, forth_img_src, fifth_img_src,
            watch_code, watch_price, watch_category, watch_description,
            first_img_description, second_img_description, third_img_description, forth_img_description, fifth_img_description;

        img_src = event.target.img_src.value;
        second_img_src = event.target.second_img_src.value;
        third_img_src = event.target.third_img_src.value;
        forth_img_src = event.target.forth_img_src.value;
        fifth_img_src = event.target.fifth_img_src.value;

        watch_code = event.target.watch_code.value;
        watch_price = event.target.watch_price.value;
        watch_category = event.target.watch_category.value;
        watch_description = event.target.watch_description.value;

        first_img_description = event.target.first_img_description.value;
        second_img_description = event.target.second_img_description.value;
        third_img_description = event.target.third_img_description.value;
        forth_img_description = event.target.forth_img_description.value;
        fifth_img_description = event.target.fifth_img_description.value;

        if (is_admin_logged_in()) {
            Images.update({_id: item_id},
                {
                    $set: {
                        img_src: img_src,
                        second_img_src: second_img_src,
                        third_img_src: third_img_src,
                        forth_img_src: forth_img_src,
                        fifth_img_src: fifth_img_src,
                        first_img_desc : first_img_description,
                        second_img_desc : second_img_description,
                        third_img_desc : third_img_description,
                        forth_img_desc : forth_img_description,
                        fifth_img_desc : fifth_img_description,
                        watch_code: parseInt(watch_code, 10),
                        watch_code_str: watch_code,
                        watch_price: parseInt(watch_price, 10),
                        watch_category: watch_category,
                        watch_description: watch_description,
                        editedOn: getJerusalemDate(),
                    }
                });
        }

        $("#edit_item_modal").modal('hide');
        return false;
    },
    'click .js-load-more': function (event) {
        Session.set("imageLimit", Session.get("imageLimit") + imageLimit);
        let current_scroll_position = $(window).scrollTop();
        setTimeout(function () {
            window.scrollTo(0, current_scroll_position);
        },100);
        //$('html,body').animate({scrollTop: document.body.scrollHeight},"fast"); // scrolling to bottom of page
    },
    'click .js-link-to-single-item': function(event) {
        Session.set("last_scroll_position", $(window).scrollTop() /* + $(window).height() */);
    }
});

Template.add_item_form.events({
    'submit .js-add-item': function (event) {
        let img_src, second_img_src, third_img_src, forth_img_src, fifth_img_src,
            watch_code, watch_price, watch_category, watch_description,
            first_img_description, second_img_description, third_img_description, forth_img_description, fifth_img_description;

        img_src = event.target.img_src.value;
        second_img_src = event.target.second_img_src.value;
        third_img_src = event.target.third_img_src.value;
        forth_img_src = event.target.forth_img_src.value;
        fifth_img_src = event.target.fifth_img_src.value;

        watch_price = event.target.watch_price.value;
        watch_code = event.target.watch_code.value;
        watch_category = event.target.watch_category.value;
        watch_description = event.target.watch_description.value;

        first_img_description = event.target.first_img_description.value;
        second_img_description = event.target.second_img_description.value;
        third_img_description = event.target.third_img_description.value;
        forth_img_description = event.target.forth_img_description.value;
        fifth_img_description = event.target.fifth_img_description.value;

        if (is_admin_logged_in()) {
            Images.insert({
                img_src: img_src,
                second_img_src: second_img_src,
                third_img_src: third_img_src,
                forth_img_src: forth_img_src,
                fifth_img_src: fifth_img_src,
                first_img_desc : first_img_description,
                second_img_desc : second_img_description,
                third_img_desc : third_img_description,
                forth_img_desc : forth_img_description,
                fifth_img_desc : fifth_img_description,
                watch_code: parseInt(watch_code, 10),
                watch_code_str: watch_code,
                watch_price: parseInt(watch_price, 10),
                watch_category: watch_category,
                watch_description: watch_description,
                createdOn: getJerusalemDate(),
                createdBy: Meteor.user().username
            });
            console.log("added catalog item")
        }
        $("#add_item_form").modal('hide');
        return false;
    }
});

Template.single_item.events({
    // selecting which src to present as large photo
    'click .js-first-img': function (event) {
        Session.set("single_item_displayed_img_src", Session.get("single_item_object").img_src);
        Session.set("single_item_displayed_desc", Session.get("single_item_object").first_img_desc);
        Session.set("cart_quested_item_index", 1);
        return false;
    },
    'click .js-second-img': function (event) {
        Session.set("single_item_displayed_img_src", Session.get("single_item_object").second_img_src);
        Session.set("single_item_displayed_desc", Session.get("single_item_object").second_img_desc);
        Session.set("cart_quested_item_index", 2);
        return false;
    },
    'click .js-third-img': function (event) {
        Session.set("single_item_displayed_img_src", Session.get("single_item_object").third_img_src);
        Session.set("single_item_displayed_desc", Session.get("single_item_object").third_img_desc);
        Session.set("cart_quested_item_index", 3);
        return false;
    },
    'click .js-forth-img': function (event) {
        Session.set("single_item_displayed_img_src", Session.get("single_item_object").forth_img_src);
        Session.set("single_item_displayed_desc", Session.get("single_item_object").forth_img_desc);
        Session.set("cart_quested_item_index", 4);
        return false;
    },
    'click .js-fifth-img': function (event) {
        Session.set("single_item_displayed_img_src", Session.get("single_item_object").fifth_img_src);
        Session.set("single_item_displayed_desc", Session.get("single_item_object").fifth_img_desc);
        Session.set("cart_quested_item_index", 5);
        return false;
    }
});

Template.single_item.helpers({
    isEmptyItem: function() {
      return !Session.get("single_item_object");
    },
    getURL: function() {
        return "https://www.versaille.co.il/catalog_item/" + Session.get("single_item_object")._id;
    },
    getWhatsappNumber: function () {
        return Meteor.settings.public.whatsapp_number;
    },
    getWatchCode: function () {
        return Session.get("single_item_object").watch_code;
    },
    getWatchPrice: function () {
        return Session.get("single_item_object").watch_price;
    },
    getOnSalePrice: function () {
        return Session.get("single_item_object").on_sale_price;
    },
    getWatchDescription: function () {
        return Session.get("single_item_object").watch_description;
    },
    getFirstImgSrc: function () {
        return Session.get("single_item_object").img_src;
    },
    getFirstImgThumbnail: function () {
        return convert_full_size_to_thumbnail_link(Session.get("single_item_object").img_src);
    },
    getSecondImgSrc: function () {
        return Session.get("single_item_object").second_img_src;
    },
    getSecondImgThumbnail: function () {
        return convert_full_size_to_thumbnail_link(Session.get("single_item_object").second_img_src);
    },
    getThirdImgSrc: function () {
        return Session.get("single_item_object").third_img_src;
    },
    getThirdImgThumbnail: function () {
        return convert_full_size_to_thumbnail_link(Session.get("single_item_object").third_img_src);
    },
    getForthImgSrc: function () {
        return Session.get("single_item_object").forth_img_src;
    },
    getForthImgThumbnail: function () {
        return convert_full_size_to_thumbnail_link(Session.get("single_item_object").forth_img_src);
    },
    getFifthImgSrc: function () {
        return Session.get("single_item_object").fifth_img_src;
    },
    getFifthImgThumbnail: function () {
        return convert_full_size_to_thumbnail_link(Session.get("single_item_object").fifth_img_src);
    },
    getMainImgSrc: function () {
        return Session.get("single_item_displayed_img_src");
    },
    getCurrentImgDesc: function () { //currently displayed image description
        return Session.get("single_item_displayed_desc");
    },
});

Template.welcome.helpers({
    getWhatsappNumber: function () {
        return Meteor.settings.public.whatsapp_number;
    },
});

Template.sidebar.events({
    'click .sidebar-number-link4300': function (event) {
        location.replace("catalog?q=4300");
    },
    'click .sidebar-number-link4200': function (event) {
        location.replace("catalog?q=4200");
    },
    'click .sidebar-number-link4100': function (event) {
        location.replace("catalog?q=4100");
    },
    'click .sidebar-number-link4000': function (event) {
        location.replace("catalog?q=4000");
    },
    'click .sidebar-number-link3900': function (event) {
        location.replace("catalog?q=3900");
    },
    'click .sidebar-number-link3800': function (event) {
        location.replace("catalog?q=3800");
    },
    'click .sidebar-number-link2800': function (event) {
        location.replace("catalog?q=2800");
    },
    'click .sidebar-number-link2700': function (event) {
        location.replace("catalog?q=2700");
    },
    'click .sidebar-number-link2600': function (event) {
        location.replace("catalog?q=2600");
    },
    'click .sidebar-number-link1900': function (event) {
        location.replace("catalog?q=1900");
    },
    'click .sidebar-number-link1800': function (event) {
        location.replace("catalog?q=1800");
    },
    'click .sidebar-number-link1700': function (event) {
        location.replace("catalog?q=1700");
    },
    'click .sidebar-number-link1600': function (event) {
        location.replace("catalog?q=1600");
    },
    'click .sidebar-number-link1500': function (event) {
        location.replace("catalog?q=1500");
    },
    'click .sidebar-number-link1400': function (event) {
        location.replace("catalog?q=1400");
    },
    'click .sidebar-number-link1300': function (event) {
        location.replace("catalog?q=1300");
    },
    'click .sidebar-number-link1100': function (event) {
        location.replace("catalog?q=1100");
    },
    'click .js-sidebar-link': function (event) {
        Session.set("last_scroll_position", 0);
    }
});

Session.setDefault("price-slider", [0, 1200]);
Template.sidebar.rendered = function () {
    this.$("#price-slider").noUiSlider({
        start: Session.get("price-slider"),
        connect: true,
        range: {
            'min': 0,
            'max': 1200
        }
    }).on('slide', function (ev, val) {
        // set real values on 'slide' event
        Session.set('price-slider', val);
    }).on('change', function (ev, val) {
        // round off values on 'change' event
        Session.set('price-slider', [Math.round(val[0]), Math.round(val[1])]);
    });
};

Template.sidebar.helpers({
    slider: function () {
        return Session.get("price-slider");
    }
});
// END ---- CATALOG ----

// Start ---- search bar ----
Template.searchBox.helpers({
    imagesIndex() {
        return ImagesIndex;
    },
    loadmoreAttributes: () => {
        return {
            type: 'button',
            class: 'btn btn-outline-secondary btn-lg btn-block',
            dir: 'rtl',
            style: "margin-top: 20px;",
        }
    },
    getThumbnailImgLink: function() {
        return convert_full_size_to_thumbnail_link(this.img_src);
    },
    searchResults: () => {
        var items = ImagesIndex.config.mongoCollection.find().fetch().slice(1) //removing the first element - contains metadata
        return items; //limited to the index show index
    }
});

Template.navbar.helpers({
    imagesIndex() {
        return ImagesIndex;
    },
    inputAttributes: () => {
        return {
            placeholder: 'חיפוש',
            type: 'search',
            class: 'js-searchBox nav-item-font-size',
            id: 'search_box_input',
            name: 'search_box_input',
            dir: 'ltr',
            //value: Session.get(searchBoxValue),
        }
    },
    isThereAnOrderInPlace: function () {
        return is_there_an_order_in_place();
    },
    openedOrderID: function () {
        return AgentCart.findOne({username: Meteor.user().username , status: "open"})._id;
    },
});

Template.navbar.events({
    'keypress .js-searchBox': function (event) {
        if (event.which === 13) { // upon pressing 'Enter' key
            event.preventDefault();
            var search_input = $(event.target).val();
            if (search_input !== '') { // move to search page if not already there
                if (Router.current().route.getName() !== 'search') {
                    Router.go('/search');
                }
                $('.navbar-collapse').collapse('hide');
            }
        }
    },
    'click .js-collapse-after-click': function (event) {
        $('.navbar-collapse').collapse('hide');
    },
    'submit .js-open-new-order' : function (event) {
        let store_name = event.target.store_name.value;
        if(AgentCart.find({username: Meteor.user().username , status: "open"}).count() === 0) {
            AgentCart.insert({
                username: Meteor.user().username,
                store_name: store_name,
                status: "open",
                products: [],
                sent_date: "הזמנה פתוחה",
                checkmark: 0
            });
            $("#new_order_form").modal('hide');

        } else {
            alert("קיימת הזמנה פתוחה, סגרו אותה על מנת לפתוח חדשה");
        }
    },
    'click .nav-link': function(event) { // reset last_scroll_position
        Session.set("last_scroll_position", 0);
    },
});
// END ---- search bar ----

// START ---- Agent cart ----
Template.catalog.events({
    'submit .js-open-new-order': function (event) {
        let store_name = event.target.store_name.value;
        if (AgentCart.find({username: Meteor.user().username, status: "open"}).count() === 0) {
            AgentCart.insert({
                username: Meteor.user().username,
                store_name: store_name,
                status: "open",
                products: [],
                sent_date: "הזמנה פתוחה",
                checkmark: 0
            });
            $("#new_order_form").modal('hide');

        } else {
            alert("קיימת הזמנה פתוחה, סגרו אותה על מנת לפתוח חדשה");
        }
    },
    'click .js-load-more-orders': function (event) {
        Session.set("ordersLimit", Session.get("ordersLimit") + ordersLimit);
        // $('html,body').animate({scrollTop: document.body.scrollHeight},"fast"); // scrolling to bottom of page
    },
});

Template.single_order.events({
    'submit .js-close-order' : function (event) {
        let notes = event.target.final_notes.value;
        let opened_order = AgentCart.findOne({username: Meteor.user().username, status: "open"});

        if(opened_order) {
            Meteor.call('server_close_order', opened_order._id, Meteor.user().username, notes);

            // sending notification email
            opened_order = AgentCart.findOne({_id: opened_order._id});
            let new_products_format, total_amount, total_price;
            [new_products_format, total_amount, total_price] = email_template_new_products_format(opened_order);

            let dataContext={
                order_store_name: opened_order.store_name,
                order_notes: notes,
                order_prodcuts: new_products_format,
                /* the new format is of the following:
                        img_url: img_url,
                        watch_code: watch_code,
                        watch_desc: watch_desc,
                        amount: amount,
                        price: price
                */
                order_total_amount: total_amount,
                order_total_price: total_price,
                order_website_url:"https://www.versaille.co.il/orders/" + opened_order._id,
                order_sent_date: getJerusalemDate() + " " + getHebrewDay(),
                order_agent_name: opened_order.username
            };
            let email_args = {
                to: email_recipient_list,
                from: sender_email,
                subject: "הזמנה חדשה מ-" + opened_order.store_name,
                html: Blaze.toHTMLWithData(Template.orderEmailContent, dataContext)
            }
            Meteor.call('server_send_email', email_args, function (error) {
                if (!error) {
                    sAlert.info("Successfully sent email!");
                } else {
                    console.log("First Error sending email:");
                    console.log(error);
                    Meteor.call('server_send_email', email_args); // retry sending email
                }
            });
        } else {
            alert("לא קיימת הזמנה פתוחה");
        }
    },
    'click .js-delete-order' : function(event){
        let opened_order = AgentCart.findOne({username: Meteor.user().username, status: "open"});
        AgentCart.remove({"_id": opened_order._id});
        $("#delete_order_modal").modal('hide');
        location.replace("/orders");
        return false;
}
})

Template.catalog.helpers({
    isAdmin: function () {
        return is_admin_logged_in();
    },
    isManager: function () {
        return is_manager_logged_in();
    },
    isAgent: function () {
       return is_agent_logged_in();
    },
    isOnSale: function () {
        let item_id = this._id;
        return is_item_on_sale(item_id);
    },
    isNotOnSale: function () {
        let item_id = this._id;
        return is_item_not_on_sale(item_id);
    },
    isThereAnOrderInPlace: function () {
        return is_there_an_order_in_place();
    },
});

Template.single_item.helpers({
    isNotLoggedIn: function () {
        return is_not_logged_in();
    },
    isAdmin: function () {
        return is_admin_logged_in();
    },
    isManager: function () {
        return is_manager_logged_in();
    },
    isAgent: function () {
        return is_agent_logged_in();
    },
    isOnSale: function () {
        let item_id = Session.get("single_item_object")._id;
        return is_item_on_sale(item_id);
    },
    isNotOnSale: function () {
        let item_id = Session.get("single_item_object")._id;
        return is_item_not_on_sale(item_id);
    },
    isThereAnOrderInPlace: function () {
        return AgentCart.find({username: Meteor.user().username , status: "open"}).count() > 0;
    },
    orderAmount: function(){
        let products_array = AgentCart.findOne({username: Meteor.user().username, status: "open"}).products;
        let displayed_image_index = Session.get("cart_quested_item_index");
        let image_id = Session.get("single_item_object")._id; // grabbing image id
        let products_array_index = find_product_index(products_array, image_id, displayed_image_index);
        if(products_array_index >= 0){
            return parseInt(products_array[products_array_index].split("_")[2]);
        }
        return 0;
    },
});

Session.setDefault("cart_quested_item_index", 1);
Template.single_item.events({
    'click .js-increment-cart': function (event) {
        event.preventDefault();
        let image_id = Session.get("single_item_object")._id; // grabbing image id
        single_item_update_cart(image_id, '+');
    },
    'click .js-decrement-cart': function (event) {
        event.preventDefault();
        let image_id = Session.get("single_item_object")._id; // grabbing image id
        single_item_update_cart(image_id, '-');
    },
    'submit .js-on-sale': function (event) {
        //event.preventDefault();
        if(is_admin_logged_in() || is_manager_logged_in()){
            let item_id = Session.get("single_item_object")._id; // grabbing image id
            let new_sale_watch_price = event.target.new_sale_watch_price.value;
                Images.update( {_id: item_id},
                    { $set: { on_sale_price: parseInt(new_sale_watch_price) } });
        }
        $("#on_sale_form_modal").modal('hide');
        //return false;
    },
    'click .js-confirm-remove-from-sale': function (event) {
        //event.preventDefault();
        if(is_admin_logged_in() || is_manager_logged_in()){
            let item_id = Session.get("single_item_object")._id; // grabbing image id
            Images.update( {_id: item_id},
                { $set: { on_sale_price: -1 } });
        }
        $("#remove_from_sale_modal").modal('hide');
        location.reload(); // otherwise the page goes muted
        return false;
    },
});

Template.orders.helpers({
    isAdmin: function () {
        return is_admin_logged_in();
    },
    isManager: function () {
        return is_manager_logged_in();
    }
});

Template.orders.events({
    'click .js-flip-checkmark': function () {
        if (is_admin_logged_in() || is_manager_logged_in()) { // only admin can do this
            let checkmark_status = parseInt(this.checkmark);
            if (checkmark_status === 1) {
                checkmark_status = 0;
            } else {
                checkmark_status = 1;
            } // logical not
            AgentCart.update({_id: this._id},
                {
                    $set: {
                        checkmark: checkmark_status
                    }
                });
        }
    },
});

Template.single_order.events({
    'click .js-flip-checkmark': function () {
        if (is_admin_logged_in() || is_manager_logged_in()) { // only admin can do this
            let checkmark_status = Session.get("single_order_object").checkmark;
            if (checkmark_status == 1) {
                checkmark_status = 0;
            } else {
                checkmark_status = 1;
            } // logical not
            AgentCart.update({_id: Session.get("single_order_object")._id},
                {
                    $set: {
                        checkmark: checkmark_status
                    }
                });
        }
    },
    'click .js-increment-cart': function (event) {
        event.preventDefault();
        single_order_update_cart(this.split("_"), '+');
    },
    'click .js-decrement-cart': function (event) {
        event.preventDefault();
        single_order_update_cart(this.split("_"), '-');
    },
    'submit .js-manager-notes': function(event) {
        if (is_admin_logged_in() || is_manager_logged_in()) { // only admin or manager can do this
            let order_id = Session.get("single_order_object")._id;
            AgentCart.update({_id: order_id},
                {
                    $set: {
                        manager_notes: event.target.manager_notes.value
                    }
                });
        }
        $("#manager_notes_form").modal('hide');
        return false;
}
});

Template.single_order.helpers({
    isAdmin: function () {
        return is_admin_logged_in();
    },
    isManager: function () {
        return is_manager_logged_in();
    },
    isEmptyOrder: function() {
        return !Session.get("single_order_object");
    },
    getStoreName: function () {
        return Session.get("single_order_object").store_name;
    },
    getDate: function () {
        return Session.get("single_order_object").sent_date;
    },
    getCheckmark: function () {
        return Session.get("single_order_object").checkmark;
    },
    isOpenOrder: function () { // return true only if order is open and the user logged in is the auther
        return (Session.get("single_order_object").status === "open") && (Meteor.user().username === Session.get("single_order_object").username);
    },
    getAgentName: function () {
        return Session.get("single_order_object").username;
    },
    getOrderNotes: function () {
        return Session.get("single_order_object").notes;
    },
    getWatchCode: function () {
        let values = this.split("_");
        return Images.findOne({ _id: values[0] }).watch_code;
    },
    getWatchPrice: function () {
        let values = this.split("_");
        return Images.findOne({ _id: values[0] }).watch_price;
    },
    getWatchImgURL: function () {
        let values = this.split("_");
        let image = Images.findOne({ _id: values[0] });
        switch(parseInt(values[1])) {
            case 1:
                return convert_full_size_to_thumbnail_link(image.img_src);
            case 2:
                return convert_full_size_to_thumbnail_link(image.second_img_src);
            case 3:
                return convert_full_size_to_thumbnail_link(image.third_img_src);
            case 4:
                return convert_full_size_to_thumbnail_link(image.forth_img_src);
            case 5:
                return convert_full_size_to_thumbnail_link(image.fifth_img_src);
        }
        return "";
    },
    getWatchImgDescription: function () {
        let values = this.split("_");
        let image = Images.findOne({ _id: values[0] });
        switch(parseInt(values[1])) {
            case 1:
                return image.first_img_desc;
            case 2:
                return image.second_img_desc;
            case 3:
                return image.third_img_desc;
            case 4:
                return image.forth_img_desc;
            case 5:
                return image.fifth_img_desc;
        }
        return image.watch_description;
    },
    getAmount: function () {
        let values = this.split("_");
        return values[2];
    },
    getTotalAmount: function () {
        let products = Session.get("single_order_object").products;
        let total_amount = 0;
        for(let i=0; i<products.length; i++){
            total_amount = total_amount + parseInt(products[i].split("_")[2]);
        }
        return total_amount;
    },
    getTotalPrice: function () {
        let products = Session.get("single_order_object").products;
        let total_price = 0;
        let values= [], image;
        for(let i=0; i<products.length; i++){
            let values = products[i].split("_");
            image = Images.findOne({ _id: values[0] });
            if(image) {
                total_price = total_price + parseInt(values[2]) * image.watch_price;
            }
        }
        return total_price;
    },
    isColsedOrder: function () {
        return Session.get("single_order_object").status === "closed";
    }
});
// END ---- Agent cart ----

Template.Unsubscribe.events({
    'click .js-unsubscribe': function(){alert("thank you!");}
});

// START ---- pdf S3 balances pdf uploads ----
var uploader = new ReactiveVar();

Template.update_balances_pdf.events({
    'submit .js-upload-s3-pdf': function(event, template) {
        event.preventDefault();
        let agent_name = event.target.agent_name.value;
        let file_object = document.getElementById('uploadPdfFile').files[0];
        if(!file_object){
            alert("בחרו קובץ");
        } else {
            var upload = new Slingshot.Upload("pdfUploads", {agent: agent_name});
            upload.send(file_object, function (error, file_s3_url) {
                uploader.set();
                if (error) {
                    console.error('Error uploading' + error);
                    console.error(error);
                    alert (" שגיאה! ");
                }
                else{
                    alert("ההעלאה בוצעה בהצלחה")
                    let old_agent_pdf_object = Agents_PDF.findOne({agent: agent_name});
                    if(old_agent_pdf_object) { // if older version exists
                        Meteor.call('delete_s3_item', old_agent_pdf_object.file_url) ; //Remove old file in s3 container
                        Agents_PDF.remove({_id: old_agent_pdf_object._id});
                    }
                    Agents_PDF.insert({
                        file_url: file_s3_url,
                        sent_date: getJerusalemDate() + " " + getHebrewDay(),
                        sent_time: Date.now(),
                        agent: agent_name
                    });
                    location.replace("orders");
                }
            });
            uploader.set(upload);
        }
    },
    'submit .js-delete-balances': function () {
        let agent_name = event.target.agent_name.value;
        let old_agent_pdf_object = Agents_PDF.findOne({agent: agent_name});
        if(old_agent_pdf_object) { // if exists
            Meteor.call('delete_s3_item', old_agent_pdf_object.file_url) ; //Remove old file in s3 container
            Agents_PDF.remove({_id: old_agent_pdf_object._id});
            alert("קובץ היתרות של הסוכן " + agent_name + " נמחק בהצלחה");
        } else {
            alert("לא קיים לסוכן " + agent_name + " קובץ יתרות");
        }
    }
});

Template.update_balances_pdf.helpers({
    progress: function () {
        var upload = uploader.get();
        if (upload)
            return Math.round(upload.progress() * 100);
        else
            return 0;
    },
});

Template.balance_pdf_viewer.helpers({
    balance_pdf_url: function () {
        let agent_pdf_object = Agents_PDF.findOne({ agent: Meteor.user().username });
        if(agent_pdf_object){
            return agent_pdf_object.file_url;
        } else {
            return null;
        }
    },
});

Template.orders.helpers({
    balance_last_updated: function () {
        let agent_pdf_object = Agents_PDF.findOne({ agent: Meteor.user().username });
        if(agent_pdf_object){
            return agent_pdf_object.sent_date;
        } else {
            return null;
        }
    },
});
// END ---- pdf S3 balances pdf uploads ----
