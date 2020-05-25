import {Accounts} from "meteor/accounts-base";
import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

// Will be true if Bootstrap 3-4 is loaded, false if Bootstrap 2 or no Bootstrap
//var bootstrap_enabled = (typeof $().emulateTransitionEnd == 'function');
//console.log(bootstrap_enabled)

let imageLimit = 12;
Session.set("imageLimit", imageLimit); // TODO: maybe limit this differently

/// accounts config
Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

$('.carousel').carousel({
  pause: true,
  interval: "1000"
})

/*Template.catalog.onCreated(function bodyOnCreated() {
  Meteor.subscribe('images');
});
Template.add_item_form.onCreated(function bodyOnCreated() {
  Meteor.subscribe('images');
});
Template.single_item.onCreated(function bodyOnCreated() {
  Meteor.subscribe('images');
});
Template.catalog.onCreated(function bodyOnCreated() {
  Meteor.subscribe('images');
});*/
Template.searchBox.onCreated(function bodyOnCreated() {
    Meteor.subscribe('images');
});

Template.main_Layout.onCreated(function bodyOnCreated() {
    Meteor.subscribe('images');
});


// Start ---- CATALOG ----
Template.catalog.helpers({
    /*  images:function(){
        if (Session.get("userFilter")){// they set a filter!
          return Images.find({createdBy:Session.get("userFilter")}, {sort:{createdOn: -1, rating:-1}});
        }
        else {
          return Images.find({}, {sort:{createdOn: -1, rating:-1}, limit:Session.get("imageLimit")});
        }
      },*/
    filtering_images: function () {
        if (Session.get("userFilter")) {// they set a filter!
            return true;
        } else {
            return false;
        }
    },
    getFilterUser: function () {
        if (Session.get("userFilter")) {// they set a filter!
            var user = Meteor.users.findOne(
                {_id: Session.get("userFilter")});
            return user.username;
        } else {
            return false;
        }
    },
    getUser: function (user_id) {
        var user = Meteor.users.findOne({_id: user_id});
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
    getSecondImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).second_img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getThirdImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).third_img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getForthImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).forth_img_src;
        } catch (e) {
        } // throws an exception that findOne is not defined for some reason
    },
    getFifthImgSrc: function () {
        try {
            return Images.findOne({_id: Session.get("item_id_to_edit")}).fifth_img_src;
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
                console.log("Deleted image of id: " + image_id);
            });
        } else {
            alert("Sign in to delete")
        }
    },
    'click .js-rate-image': function (event) {
        var rating = $(event.currentTarget).data("userrating");
        //console.log(rating);
        var image_id = this.data_id;
        //console.log(image_id);

        Images.update({_id: image_id},
            {$set: {rating: rating}});
    },
    'click .js-add_item_form': function (event) {
        $("#add_item_form").modal('show');
    },
    'click .js-edit_item_button': function (event) {
        Session.set("item_id_to_edit", this._id);
        $("#edit_item_modal").modal('hide');
    },
    'submit .js-edit-item': function (event) {
        var item_id = Session.get("item_id_to_edit");
        var img_src, second_img_src, third_img_src, forth_img_src, fifth_img_src,
            watch_code, watch_price, watch_category, watch_description;
        img_src = event.target.img_src.value;
        second_img_src = event.target.second_img_src.value;
        third_img_src = event.target.third_img_src.value;
        forth_img_src = event.target.forth_img_src.value;
        fifth_img_src = event.target.fifth_img_src.value;
        watch_code = event.target.watch_code.value;
        watch_price = event.target.watch_price.value;
        watch_category = event.target.watch_category.value;
        watch_description = event.target.watch_description.value;
        if (img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            img_src = img_src.replace(/\bopen\b/g, 'uc');
        } // changing google drive to presentable format
        if (second_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            second_img_src = second_img_src.replace(/\bopen\b/g, 'uc');
        } if (third_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            third_img_src = third_img_src.replace(/\bopen\b/g, 'uc');
        } if (forth_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            forth_img_src = forth_img_src.replace(/\bopen\b/g, 'uc');
        } if (fifth_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            fifth_img_src = fifth_img_src.replace(/\bopen\b/g, 'uc');
        }
        if (Meteor.user()) {
            Images.update({_id: item_id},
                {
                    $set: {
                        img_src: img_src,
                        second_img_src: second_img_src,
                        third_img_src: third_img_src,
                        forth_img_src: forth_img_src,
                        fifth_img_src: fifth_img_src,
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
    'click .js-unset-image-filter': function (event) {
        Session.set("userFilter", undefined);
    },
    'click .js-load-more': function (event) {
        Session.set("imageLimit", Session.get("imageLimit") + imageLimit);
    },
});

Template.add_item_form.events({
    'submit .js-add-item': function (event) {
        var img_src, second_img_src, third_img_src, forth_img_src, fifth_img_src,
            watch_code, watch_price, watch_category, watch_description;

        img_src = event.target.img_src.value;
        second_img_src = event.target.second_img_src.value;
        third_img_src = event.target.third_img_src.value;
        forth_img_src = event.target.forth_img_src.value;
        fifth_img_src = event.target.fifth_img_src.value;
        watch_price = event.target.watch_price.value;
        watch_code = event.target.watch_code.value;
        watch_category = event.target.watch_category.value;
        watch_description = event.target.watch_description.value;
        if (img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            img_src = img_src.replace(/\bopen\b/g, 'uc');
        } // changing google drive to presentable format
        if (second_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            second_img_src = second_img_src.replace(/\bopen\b/g, 'uc');
        } if (third_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            third_img_src = third_img_src.replace(/\bopen\b/g, 'uc');
        } if (forth_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            forth_img_src = forth_img_src.replace(/\bopen\b/g, 'uc');
        } if (fifth_img_src.match(/^https:\/\/drive.google.com\/open/g)) {
            fifth_img_src = fifth_img_src.replace(/\bopen\b/g, 'uc');
        }
        if (Meteor.user()) {
            Images.insert({
                img_src: img_src,
                second_img_src: second_img_src,
                third_img_src: third_img_src,
                forth_img_src: forth_img_src,
                fifth_img_src: fifth_img_src,
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
        Session.set("single_item_img_src", Session.get("single_item").img_src);
        return false;
    },
    'click .js-second-img': function (event) {
        Session.set("single_item_img_src", Session.get("single_item").second_img_src);
        return false;
    },
    'click .js-third-img': function (event) {
        Session.set("single_item_img_src", Session.get("single_item").third_img_src);
        return false;
    },
    'click .js-forth-img': function (event) {
        Session.set("single_item_img_src", Session.get("single_item").forth_img_src);
        return false;
    },
    'click .js-fifth-img': function (event) {
        Session.set("single_item_img_src", Session.get("single_item").fifth_img_src);
        return false;
    }
});

Template.single_item.helpers({
    getSingleItemImgSrc: function () {
        return Session.get("single_item_img_src");
    },
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

/*$('.navbar-nav>li>a').on('click', function(){
    $('.navbar-collapse').collapse('hide');
});*/

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

// START ---- tinymce ----
var tinymce_init = function () {
    //we need to remove the old instances?
    //tinymce.EditorManager.editors = [];
    var headerConfig = {
        selector: '.tinymce-header',
        menubar: false,
        inline: true,
        plugins: [
            'lists',
            'powerpaste',
            'autolink'
        ],
        toolbar: 'undo redo | bold italic underline',
        valid_elements: 'strong,em,span[style],a[href]',
        valid_styles: {
            '*': 'font-size,font-family,color,text-decoration,text-align'
        },
        powerpaste_word_import: 'clean',
        powerpaste_html_import: 'clean',
        content_css: '//www.tiny.cloud/css/codepen.min.css'
    };
    tinymce.init(headerConfig);

    var bodyConfig = {
        selector: '.tinymce-body',
        menubar: false,
        inline: true,
        plugins: [
            'link',
            'lists',
            'powerpaste',
            'autolink',
            'tinymcespellchecker'
        ],
        toolbar: [
            'undo redo | bold italic underline | fontselect fontsizeselect',
            'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'
        ],
        valid_elements: 'p[style],strong,em,span[style],a[href],ul,ol,li',
        valid_styles: {
            '*': 'font-size,font-family,color,text-decoration,text-align'
        },
        powerpaste_word_import: 'clean',
        powerpaste_html_import: 'clean'
    };
    tinymce.init(bodyConfig);

    tinymce.init({
        selector: 'textarea',
        skin_url: '/packages/teamon_tinymce/skins/lightgray',
        menubar: false,
        menu: {
            file: {title: 'File', items: 'newdocument'},
            edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
            insert: {title: 'Insert', items: 'link media | template hr'},
            view: {title: 'View', items: 'visualaid'},
            format: {
                title: 'Format',
                items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'
            },
            table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
            tools: {title: 'Tools', items: 'spellchecker code'}
        },
    });

    tinymce.init({
        selector: 'div.tinymce',
        skin_url: '/packages/teamon_tinymce/skins/lightgray',
        theme: 'inlite',
        menubar: false,
        inline: true
    });
}

Template.test.onRendered(tinymce_init);
Template.add_item_form.onRendered(tinymce_init);

Template.welcome.onCreated(function bodyOnCreated() {
    Meteor.subscribe('pages_text');
});
Template.welcome.helpers({
    getInlineText: function () {
        try {
            var txt = PagesText.findOne({_id: "welcome_page_body_text"}).text;
            console.log("helper: " + txt)
            document.getElementById("welcome-body-text").innerHTML = txt;
        } catch (e) {
        }
    },
});


Template.test.onCreated(function bodyOnCreated() {
    Meteor.subscribe('pages_text');
});

Template.test.events({
    'click .js-welcome-body-tinymce': function (event) {
        var txt = document.getElementById("welcome-body-tinymce").innerHTML;
        console.log("events: " + txt)
        if (Meteor.user()) {
            PagesText.update(
                { _id: "welcome_page_body_text" },
                { $set: {text: txt} },
                { upsert: true })
        };
        return false;
    },
});

Template.test.helpers({
    getWelcomeBodyText: function () {
        try {
            var txt = PagesText.findOne({_id: "welcome_page_body_text"}).text;
            document.getElementById("welcome-body-tinymce").innerHTML = txt;
        } catch (e) {
        }
    },
});
// END ---- tinymce ----
