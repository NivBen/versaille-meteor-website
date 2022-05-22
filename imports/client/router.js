import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';

Router.configure({
    layoutTemplate: 'main_Layout'
});

Router.route('/', function () {
    document.title = 'שעוני ורסאי';
    this.render('navbar', {to: "navbar"});
    this.render('welcome', {to: "main"});
    this.render('footer', {to: "footer"});
}, {
    name: 'main_page'
});

Router.route('/unsubscribe', {
    onBeforeAction: function () { // only renders for logged in users
        if (is_agent_logged_in()) {
            this.next();
        } else {
            this.render('navbar', {to: 'navbar'});
            this.render('login', {to: 'main'});
        }
    },
    action: function () {
        document.title = 'הסרה מרישום';
        this.render('Unsubscribe', {
            to: 'main',
        });
    }
});

Router.route('/aboutus', function () {
    document.title = 'אודות שעוני ורסאי';
    this.render('navbar', {to: 'navbar'});
    this.render('aboutus', {to: 'main'});
    this.render('footer', {to: 'footer'});
});

Router.route('/login', function () {
    document.title = 'התחברות - שעוני ורסאי';
    this.render('navbar', {to: 'navbar'});
    this.render('login', {to: 'main'});
    this.render('footer', {to: 'footer'});
}, {
    name: 'login'
});

Router.route('/changePassword', {
    onBeforeAction: function(){ // only renders for logged in users
        if(is_agent_logged_in()){
            this.next();
        } else {
            this.render('navbar', {to: 'navbar'});
            this.render('login', {to: 'main'});
            this.render('footer', {to: 'footer'});
        }
    },
    action: function() {
        document.title = 'שינוי סיסמא';
        this.render('navbar', {to: 'navbar'});
        this.render('changePassword', {to: 'main'});
    }
});

Router.route('/search', function () {
    document.title = 'קטלוג שעוני ורסאי';
    this.render('navbar', {to: 'navbar'});
    this.render('searchBox', {to: 'main'});
    // this.render('footer', {to: 'footer'});
});

Router.route('/catalog', function () {
    document.title = 'קטלוג שעוני ורסאי';
    var query = this.params.query;
    //console.log('query.q=' + query.q);
    this.render('navbar', {to: 'navbar'});

    let min_price = Session.get('price-slider')[0];
    let max_price = Session.get('price-slider')[1];

    if (typeof query.q === 'undefined' || query.q === null || query.q === '') { //there's NO filter!
        this.render('catalog', {
            to: 'main',
            data: function() {
                let images = Images.find({$and: [{watch_price: {$gte: min_price}}, {watch_price: {$lte: max_price}}]},
                    {sort: {watch_code: -1}, limit: Session.get('imageLimit')});
                return {
                    images: images
                }
            }
        });
    } else { // there's a filter
        switch (query.q) {
            case 'women-versaille':
                this.render('catalog', {
                    to: 'main',
                    data: function() {
                        let images = Images.find({ $and: [ {'watch_category': '1'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1},
                                limit: Session.get('imageLimit')
                            })
                        return {
                            images: images
                        }
                    }
                });
                break;

            case 'men-versaille':
                this.render('catalog', {
                    to: 'main',
                    data: function() {
                        let images = Images.find({ $and: [ {'watch_category': '2'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1},
                                limit: Session.get('imageLimit')
                            })
                        return {
                            images: images
                        }
                    }
                });
                break;

            case 'women-vegas':
                this.render('catalog', {
                    to: 'main',
                    data: function() {
                        let images = Images.find({ $and: [ {'watch_category': '3'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1},
                                limit: Session.get('imageLimit')
                            })
                        return {
                            images: images
                        }
                    }
                });
                break;

            case 'men-vegas':
                this.render('catalog', {
                    to: 'main',
                    data: function() {
                        let images = Images.find({ $and: [ {'watch_category': '4'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1},
                                limit: Session.get('imageLimit')
                            });
                        return {
                            images: images
                        }
                    }
                });
                break;

            case 'digital-children':
                this.render('catalog', {
                    to: 'main',
                    data: function() {
                        let images = Images.find({ $and: [ {'watch_category': '5'}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1},
                                limit: Session.get('imageLimit')
                            })
                        return {
                            images: images
                        }
                    }
                });
                break;

            case 'on-sale':
                this.render('catalog', {
                    to: 'main',
                    data: function() {
                        let images = Images.find({ $and: [ {on_sale_price: { $gte: 0 }}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price } }]},
                            {
                                sort: {watch_code: -1},
                                limit: Session.get('imageLimit')
                            });
                        return {
                            images: images
                        }
                    }
                });
                break;

            default: // catalog number like 1100, 3600, 4000
                let catalog_number = 990000 + parseInt(query.q); // catalog first number like 991100, 993600, 994000
                this.render('catalog', {
                    to: 'main',
                    data: function() {
                        let images = Images.find({ $and: [ {watch_code: { $gte: catalog_number }}, {watch_code: { $lt: catalog_number + 100 }}, {watch_price: { $gte: min_price }}, {watch_price: { $lte: max_price }} ]},
                            {
                                sort: {watch_code: -1},
                                limit: Session.get('imageLimit')
                            });
                        return {
                            images: images
                        }
                    }
                });
            // code block
        }
    }
    // this.render('footer', {to: 'footer'});
}, {
    name: 'catalog'
});  // No footer due to infinite scroll

Router.route('/catalog_item/:_id', function () {
    document.title = 'שעוני ורסאי';
    let current_item_object = Images.findOne({_id: this.params._id});
    Session.set('single_item_object', current_item_object);
    if(current_item_object) {
        Session.set('single_item_displayed_img_src', Session.get('single_item_object').img_src);
        Session.set('single_item_displayed_desc', Session.get('single_item_object').first_img_desc);
        Session.set('cart_quested_item_index', 1); // sets index to 1 whenever accessing the single item page
    }
    this.render('navbar', {to: 'navbar'});
    this.render('single_item', {to: 'main',});
    this.render('footer', {to: 'footer'});
}, {
    name: 'catalog.item'
});

Router.route('/orders', {
    onBeforeAction: function(){ // only renders for logged in users
        if(is_agent_logged_in()){
            this.next();
        } else {
            this.render('navbar', {to: 'navbar'});
            this.render('login', {to: 'main'});
        }
    },
    action: function(){
        document.title = 'הזמנות שעוני ורסאי';
        this.render('navbar', {to: 'navbar'});
        if(is_admin_logged_in() || is_manager_logged_in()){
            this.render('orders', {
                to: 'main',
                data: function() { // status: -1 means open orders will show first
                    let cart = AgentCart.find({}, {sort: {status: -1, sent_time: -1}, limit: Session.get('ordersLimit')});
                    return {
                        cart: cart
                    }
                }
            });
        }
        else { // other agents
            this.render('orders', {
                to: 'main',
                data: function() { // status: -1 means open orders will show first
                    let cart = AgentCart.find({username: Meteor.user().username}, {sort: {status: -1, sent_time: -1}, limit: Session.get('ordersLimit')})
                    return {
                        cart: cart
                    }
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
            this.render('navbar', {to: 'navbar'});
            this.render('login', {to: 'main'});
        }
    },
    action: function() {
        document.title = 'הזמנה';
        let current_order_object = AgentCart.findOne({_id: this.params._id});
        Session.set('single_order_object', current_order_object);
        this.render('navbar', {to: 'navbar'});
        this.render('single_order', {
            to: 'main',
            data: function() {
                let order = current_order_object
                return {
                    order: order
                }
            }
        });
        this.render('footer', {to: 'footer'});
    }
});

Router.route('/update_balances_pdf', {
    onBeforeAction: function () {
        if(is_admin_logged_in() || is_manager_logged_in()){
            this.next();
        } else {
            this.render('navbar', {to: 'navbar'});
            this.render('login', {to: 'main'});
        }
    },
    action: function () {
        document.title = 'עדכון יתרות שעוני ורסאי';
        this.render('navbar', {to: 'navbar'});
        this.render('update_balances_pdf', {to: 'main'});
    }
});

Router.route('/balance', {
    onBeforeAction: function () {
        if(is_agent_logged_in()){
            this.next();
        } else {
            this.render('navbar', {to: 'navbar'});
            this.render('login', {to: 'main'});
        }
    },
    action: function () {
        document.title = 'מצב יתרות שעוני ורסאי';
        this.render('navbar', {to: 'navbar'});
        this.render('balance_pdf_viewer', {to: 'main'});
    }
});

// slow scroll
Router._scrollToHash = function (hash) {
    var section = $(hash);
    if (section.length) {
        var sectionTop = section.offset().top;
        $('html, body').animate({
            scrollTop: sectionTop
        }, 'slow');
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


Router.route('/test', function () {
    this.render('404notfound', {to: 'main'});
});
