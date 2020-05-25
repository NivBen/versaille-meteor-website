import {Router} from 'meteor/iron:router';

/// routing
Router.configure({
    layoutTemplate: 'main_Layout'
});

Router.route('/test', function () { // area 51 testing
    document.title = 'Area 51';
    this.render('test', {to: "main"});

});

Router.route('/', function () {
    document.title = 'שעוני ורסאי';
    this.render('navbar', {to: "navbar"});
    this.render('welcome', {to: "main"});
    this.render('footer', {to: "footer"});
});

Router.route('/aboutus', function () {
    document.title = 'על שעוני ורסאי';
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
});

Router.route('/catalog', function () {
    document.title = 'קטלוג שעוני ורסאי';
    var query = this.params.query;
    //console.log("query.q=" + query.q);
    this.render('navbar', {to: "navbar"});
    if (typeof query.q === 'undefined' || query.q === null || query.q === '') { //there's NO filter!
        this.render('catalog', {
            to: "main",
            data: {
                images: Images.find({}, {sort: {watch_code: -1, rating: -1}, limit: Session.get("imageLimit")}) //.fetch()
            }
        });
    } else { // there's a filter
        switch (query.q) {
            case 'women-versaille':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({'watch_category': '1'}, {
                            sort: {watch_price: -1, rating: -1},
                            limit: Session.get("imageLimit")
                        })
                    }
                });
                break;

            case 'men-versaille':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({'watch_category': '2'}, {
                            sort: {watch_price: -1, rating: -1},
                            limit: Session.get("imageLimit")
                        })
                    }
                });
                break;

            case 'women-vegas':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({'watch_category': '3'}, {
                            sort: {watch_price: -1, rating: -1},
                            limit: Session.get("imageLimit")
                        })
                    }
                });
                break;

            case 'men-vegas':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({'watch_category': '4'}, {
                            sort: {watch_price: -1, rating: -1},
                            limit: Session.get("imageLimit")
                        })
                    }
                });
                break;

            case 'digital-children':
                this.render('catalog', {
                    to: "main", data: {
                        images: Images.find({'watch_category': '5'}, {
                            sort: {watch_price: -1, rating: -1},
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
                        images: Images.find(find_query, {
                            sort: {watch_price: -1, rating: -1},
                            limit: Session.get("imageLimit")
                        })
                    }
                });
            // code block
        }
        /*console.log("there's a filter");
        this.render('catalog', {to: "main", data: {
            images: Images.find({}, {sort:{watch_price: -1, rating:-1}, limit:Session.get("imageLimit")}) //.fetch()
          }
        });*/
    }
}, {
    name: 'catalog'
});  // No footer due to infinite scroll


Router.route('/catalog_item/:_id', function () {
    document.title = 'שעוני ורסאי';
    this.render('navbar', {to: "navbar"});
    this.render('single_item', {
        to: "main",
        data: function () {
            var catalog_item = Images.findOne({_id: this.params._id})
            Session.set("single_item", catalog_item);
            Session.set("single_item_img_src", catalog_item.img_src);
            return catalog_item;
        }
    });
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
