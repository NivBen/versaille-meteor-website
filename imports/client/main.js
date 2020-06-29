import {Accounts} from "meteor/accounts-base";
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
//import { Slingshot } from 'meteor/edgee:slingshot';

let imageLimit = 16; // TODO: maybe limit this differently
Session.set("imageLimit", imageLimit);

/// accounts config
Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

$('.carousel').carousel({
    pause: true,
    interval: "1000"
})

Template.searchBox.onCreated(function bodyOnCreated() {
    Meteor.subscribe('images');
});

Template.main_Layout.onCreated(function bodyOnCreated() {
    Meteor.subscribe('images');
    //Meteor.subscribe('s3_images');
    Meteor.subscribe('cart');
});


Template.registerHelper('and',(a,b)=>{
    return a && b;
});
Template.registerHelper('or',(a,b)=>{
    return a || b;
});

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
        if (Meteor.user()) {
            console.log("id of image quested for deletion: " + image_id);
            $('.confirm-delete').click(function () {
                $('#delete_' +
                    '').modal('hide');
                Images.remove({"_id": image_id});
                $("#delete_item_modal").modal('hide');
                console.log("Deleted image of id: " + image_id);
            });
        } else {
            alert("Sign in to delete")
        }
    },
    'click .js-rate-image': function (event) {
        var rating = $(event.currentTarget).data("userrating");
        var image_id = this.data_id;

        Images.update({_id: image_id},
            {$set: {rating: rating}});
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

        if (Meteor.user()) {
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
                        editedOn: new Date(),
                    }
                });
        }

        $("#edit_item_modal").modal('hide');
        return false;
    },
    'click .js-load-more': function (event) {
        Session.set("imageLimit", Session.get("imageLimit") + imageLimit);
        $('html,body').animate({scrollTop: document.body.scrollHeight},"fast"); // scrolling to bottom of page
    },
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

        if (Meteor.user()) {
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
                createdOn: new Date(),
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
    getWatchCode: function () {
        return Session.get("single_item_object").watch_code;
    },
    getWatchPrice: function () {
        return Session.get("single_item_object").watch_price;
    },
    getWatchDescription: function () {
        return Session.get("single_item_object").watch_description;
    },
    getFirstImgSrc: function () {
        return Session.get("single_item_object").img_src;
    },
    getFirstImgThumbnail: function () {
        return Session.get("single_item_object").img_src;
    },
    getSecondImgSrc: function () {
        return Session.get("single_item_object").second_img_src;
    },
    getSecondImgThumbnail: function () {
        return Session.get("single_item_object").second_img_src;
    },
    getThirdImgSrc: function () {
        return Session.get("single_item_object").third_img_src;
    },
    getThirdImgThumbnail: function () {
        return Session.get("single_item_object").third_img_src;
    },
    getForthImgSrc: function () {
        return Session.get("single_item_object").forth_img_src;
    },
    getForthImgThumbnail: function () {
        return Session.get("single_item_object").forth_img_src;
    },
    getFifthImgSrc: function () {
        return Session.get("single_item_object").fifth_img_src;
    },
    getFifthImgThumbnail: function () {
        return Session.get("single_item_object").fifth_img_src;
    },
    getMainImgSrc: function () {
        return Session.get("single_item_displayed_img_src");
    },
    getCurrentImgDesc: function () { //currently displayed image description
        return Session.get("single_item_displayed_desc");
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
            class: 'js-searchBox',
            id: 'search_box_input',
            name: 'search_box_input',
            dir: 'rtl',
            //value: Session.get(searchBoxValue),
        }
    }
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
});
// END ---- search bar ----

// START ---- Shopping cart ----
Template.catalog.events({
    'submit .js-open-new-order' : function (event) {
        let store_name = event.target.store_name.value;
        if(ShoppingCart.find({username: Meteor.user().username , status: "open"}).count() === 0) {
            ShoppingCart.insert({
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
    'submit .js-close-order' : function (event) {
        let notes = event.target.final_notes.value;
        let opened_order = ShoppingCart.findOne({username: Meteor.user().username, status: "open"});
        if(opened_order) {
            let date = new Date();
            let hebrew_day = 'ראשון';
            switch(date.getDay()) { // day to hebrew
                case 0:
                    break;
                case 1:
                    hebrew_day = 'שני';
                    break;
                case 2:
                    hebrew_day = 'שלישי';
                    break;
                case 3:
                    hebrew_day = 'רביעי';
                    break;
                case 4:
                    hebrew_day = 'חמישי';
                    break;
                case 5:
                    hebrew_day = 'שישי';
                    break;
                case 6:
                    hebrew_day = 'שבת';
                    break;
            }

            ShoppingCart.update({_id: opened_order._id, username: Meteor.user().username},
                {
                    $set: {
                        status: "closed",
                        notes: notes,
                        sent_date: date.getUTCDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCFullYear() + ', ' + hebrew_day + ', ' + addZero(date.getUTCHours()) + ':' + addZero(date.getUTCMinutes()),
                        sent_time: date.getTime()
                    }
                });
        } else {
            alert("לא קיימת הזמנה פתוחה");
        }
    },
    'click .js-delete-order' : function(event){
        let opened_order = ShoppingCart.findOne({username: Meteor.user().username, status: "open"});
        ShoppingCart.remove({"_id": opened_order._id});
        $("#delete_order_modal").modal('hide');
}
})

function addZero(i) { // for date
    if (i < 10) { i = "0" + i; }
    return i;
}

Template.catalog.helpers({
    isAdmin: function () {
        return is_admin_logged_in();
    },
    isAgent: function () {
       return is_agent_logged_in();
    },
    isThereAnOrderInPlace: function () {
        return ShoppingCart.find({username: Meteor.user().username , status: "open"}).count() > 0;
    },
});

let is_agent_logged_in = function() {
    return !!Meteor.user(); // TODO: change this to list of agents
}

let is_admin_logged_in = function() {
    if(Meteor.user()) {
        return Meteor.user().username === "admin";
    } else{
        return false;
    }
}

let update_cart = function(image_id, flag) {
    let opened_order = ShoppingCart.findOne({username: Meteor.user().username, status: "open"});
    if (opened_order){
        let displayed_image_index = Session.get("cart_quested_item_index");
        let products_array = opened_order.products;
        let products_array_index = find_product_index(products_array, image_id, displayed_image_index);
        Meteor.call('server_update_cart', flag, opened_order, products_array_index, image_id, displayed_image_index);
    } else {
        alert("לא קיימת הזמנה פתוחה");
    }
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

Template.single_item.helpers({
    isAgent: function () {
        return is_agent_logged_in();
    },
    isThereAnOrderInPlace: function () {
        return ShoppingCart.find({username: Meteor.user().username , status: "open"}).count() > 0;
    },
    orderAmount: function(){
        let products_array = ShoppingCart.findOne({username: Meteor.user().username, status: "open"}).products;
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
        update_cart(image_id, '+');
    },
    'click .js-decrement-cart': function (event) {
        event.preventDefault();
        let image_id = Session.get("single_item_object")._id; // grabbing image id
        update_cart(image_id, '-');
    }
});


Template.orders.helpers({
    isAdmin: function () {
        return is_admin_logged_in();
    },
});

Template.single_order.events({
    'click .js-flip-checkmark': function () {
        if (is_admin_logged_in()) { // only admin can do this
            let checkmark_status = Session.get("single_order_object").checkmark;
            if (checkmark_status == 1) {
                checkmark_status = 0;
            } else {
                checkmark_status = 1;
            } // logical not
            ShoppingCart.update({_id: Session.get("single_order_object")._id},
                {
                    $set: {
                        checkmark: checkmark_status
                    }
                });
            alert("מצב ההזמנה השתנה");
        }
    }
});

Template.single_order.helpers({
    getStoreName: function () {
        return Session.get("single_order_object").store_name;
    },
    getDate: function () {
        return Session.get("single_order_object").sent_date;
    },
    getStatus: function () {
        return Session.get("single_order_object").checkmark;
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
                return image.img_src;
            case 2:
                return image.second_img_src;
            case 3:
                return image.third_img_src;
            case 4:
                return image.forth_img_src;
            case 5:
                return image.fifth_img_src;
        }
        return "";
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
        let values= [];
        for(let i=0; i<products.length; i++){
            let values = products[i].split("_");
            total_price = total_price + parseInt(values[2]) * Images.findOne({ _id: values[0] }).watch_price;
        }
        return total_price;
    }
})
// END ---- Shopping cart ----

