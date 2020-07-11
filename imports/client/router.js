import {Router} from 'meteor/iron:router';
import {Meteor} from "meteor/meteor";

/// routing
Router.configure({
    layoutTemplate: 'main_Layout'
});

Router.route('/', function () {
    document.title = 'שעוני ורסאי';
    this.render('navbar', {to: "navbar"});
    this.render('welcome', {to: "main"});
    this.render('footer', {to: "footer"});
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

Router.route('/unsubscribe', {
    onBeforeAction: function () { // only renders for logged in users
        if (is_agent_logged_in()) {
            this.next();
        } else {
            this.render('navbar', {to: "navbar"});
            this.render("login", {to: "main"});
        }
    },
    action: function () {
        document.title = 'הסרה מרישום';
        this.render('Unsubscribe', {
            to: "main",
        });
    }
});


Router.route('/aboutus', function () {
    document.title = 'אודות שעוני ורסאי';
    this.render('navbar', {to: "navbar"});
    this.render('aboutus', {to: "main"});
    this.render('footer', {to: "footer"});
});

Router.route('/login', function () {
    document.title = 'התחברות - שעוני ורסאי';
    this.render('navbar', {to: "navbar"});
    this.render('login', {to: "main"});
    this.render('footer', {to: "footer"});
});

Router.route('/search', function () {
    document.title = 'קטלוג שעוני ורסאי';
    this.render('navbar', {to: "navbar"});
    this.render('searchBox', {to: "main"});
    // this.render('footer', {to: "footer"});
});

Router.route('/orders', {
    onBeforeAction: function(){ // only renders for logged in users
        if(is_agent_logged_in()){
            this.next();
        } else {
            this.render('navbar', {to: "navbar"});
            this.render("login", {to: "main"});
        }
    },
    action: function(){
        document.title = 'הזמנות שעוני ורסאי';
        this.render('navbar', {to: "navbar"});
        if(is_admin_logged_in()){
            this.render('orders', {
                to: "main",
                data: { // status: -1 means open orders will show first
                    cart: ShoppingCart.find({}, {sort: {status: -1, sent_time: -1}, limit: Session.get("ordersLimit")})
                }
            });
        }
        else { // other agents
            this.render('orders', {
                to: "main",
                data: {
                    cart: ShoppingCart.find({username: Meteor.user().username}, {sort: {sent_time: -1}, limit: 10})
                }
            });
        }
    }
});

Router.route('/orders/:_id',{
    onBeforeAction: function(){ // only renders for logged in users
        if(is_agent_logged_in()){
            this.next();
        } else {
            this.render('navbar', {to: "navbar"});
            this.render("login", {to: "main"});
        }
    },
    action: function() {
        document.title = 'הזמנה';
        Session.set("single_order_object", ShoppingCart.findOne({_id: this.params._id}));
        this.render('navbar', {to: "navbar"});
        this.render('single_order', {
            to: "main",
            data: {
                order: ShoppingCart.findOne({ _id: this.params._id }) //.fetch()
            }
        });
        this.render('footer', {to: "footer"});
    }
});

Router.route('/catalog', function () {
    document.title = 'קטלוג שעוני ורסאי';
    var query = this.params.query;
    //console.log("query.q=" + query.q);
    this.render('navbar', {to: "navbar"});

    let min_price = Session.get("price-slider")[0];
    let max_price = Session.get("price-slider")[1];

    if (typeof query.q === 'undefined' || query.q === null || query.q === '') { //there's NO filter!
        this.render('catalog', {
            to: "main",
            data: {
                images: Images.find({ $and: [ {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]} ,
                                     { sort: { watch_code: -1, rating: -1 }, limit: Session.get("imageLimit") }) //.fetch()
            }
        });
    } else { // there's a filter
        switch (query.q) {
            case 'women-versaille':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({ $and: [ {'watch_category': '1'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                            sort: {watch_code: -1, rating: -1},
                            limit: Session.get("imageLimit")
                            })
                    }
                });
                break;

            case 'men-versaille':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({ $and: [ {'watch_category': '2'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1, rating: -1},
                            limit: Session.get("imageLimit")
                            })
                    }
                });
                break;

            case 'women-vegas':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({ $and: [ {'watch_category': '3'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                            sort: {watch_code: -1, rating: -1},
                            limit: Session.get("imageLimit")
                            })
                    }
                });
                break;

            case 'men-vegas':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({ $and: [ {'watch_category': '4'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                            sort: {watch_code: -1, rating: -1},
                            limit: Session.get("imageLimit")
                            })
                    }
                });
                break;

            case 'digital-children':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({ $and: [ {'watch_category': '5'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                            sort: {watch_code: -1, rating: -1},
                            limit: Session.get("imageLimit")
                            })
                    }
                });
                break;

            case 'on-sale':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({ $and: [ {on_sale_price: { $gte: 0 }}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1, rating: -1},
                                limit: Session.get("imageLimit")
                            })
                    }
                });
                break;

            default: // catalog number like 1100, 3600, 4000
                var find_query = {};
                find_query['watch_code_str'] = new RegExp('^99' + query.q.substring(0, 2), ''); // reg_exp=/^9911/
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({ $and: [ find_query, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                            sort: {watch_code: -1, rating: -1},
                            limit: Session.get("imageLimit")
                            })
                    }
                });
            // code block
        }
    }
    // this.render('footer', {to: "footer"});
}, {
    name: 'catalog'
});  // No footer due to infinite scroll

Router.route('/catalog_item/:_id', function () {
    document.title = 'שעוני ורסאי';
    Session.set("single_item_object", Images.findOne({_id: this.params._id}));
    Session.set("single_item_displayed_img_src", Session.get("single_item_object").img_src);
    Session.set("single_item_displayed_desc", Session.get("single_item_object").first_img_desc);
    Session.set("cart_quested_item_index", 1); // sets index to 1 whenever accessing the single item page
    this.render('navbar', {to: "navbar"});
    this.render('single_item', {to: "main",});
    this.render('footer', {to: "footer"});
}, {
    name: 'catalog.item'
});

// slow scroll
Router._scrollToHash = function (hash) {
    var section = $(hash);
    if (section.length) {
        var sectionTop = section.offset().top;
        $("html, body").animate({
            scrollTop: sectionTop
        }, "slow");
    }
};

// reaching an anchor link from another page
Router.onAfterAction(function () {
    var self = this;
    $(window).scrollTop(0);     // always start by resetting scroll to top of the page
    if (this.params.hash) {     // if there is a hash in the URL, handle it
        Tracker.afterFlush(function () {
            if (typeof $("#" + self.params.hash).offset() != "undefined") {
                var scrollTop = $("#" + self.params.hash).offset().top;

                $("html,body").animate({
                    scrollTop: scrollTop
                }, "slow");
            }
        });
    }
});
