import { Router } from 'meteor/iron:router';

/// routing
Router.configure({
  layoutTemplate: 'main_Layout'
});

Router.route('/test', function () { // area 51 testing

  this.render('test', {to: "main"});

});

Router.route('/', function () {
  this.render('navbar', {to: "navbar"});
  this.render('welcome', {to: "main"});
  this.render('footer', {to: "footer"});
});

Router.route('/aboutus', function () {
  this.render('navbar', {to: "navbar"});
  this.render('aboutus', {to: "main"});
  this.render('footer', {to: "footer"});
});

Router.route('/login', function () {
  this.render('navbar', {to: "navbar"});
  this.render('login', {to: "main"});
  this.render('footer', {to: "footer"});
});

Router.route('/search', function () {
  this.render('navbar', {to:"navbar"});
  this.render('searchBox', {to: "main"});
});

Router.route('/catalog', function () {
  var query = this.params.query;
  console.log("query.q=" + query.q);
  this.render('navbar', {to: "navbar"});
  if(typeof query.q === 'undefined' || query.q === null || query.q == ''){
    console.log("there's NO filter! :(");
    this.render('catalog', {
      to: "main",
      data: {
        images: Images.find({}, {sort:{watch_code: -1, rating:-1}, limit:Session.get("imageLimit")}) //.fetch()
      }
    });
  } else { // there's a filter!
    console.log("there's a filter!");
    this.render('catalog', {
      to: "main",
      data: {
        images: Images.find({}, {sort:{watch_code: -1, rating:-1}, limit:Session.get("imageLimit")}) //.fetch()
      }
    });
  }
  /*this.render('catalog', {
    to: "main",
    data: {
      images: Images.find({}, {sort:{watch_price: -1, rating:-1}, limit:Session.get("imageLimit")})
    }
  });*/ // No footer due to infinite scroll
}, {
    name: 'catalog'
});

Router.route('/image/:_id', function () {
  this.render('navbar', {to: "navbar"});
  this.render('single_item', {
    to: "main",
    data: function(){
      return Images.findOne({_id: this.params._id});
    }
  });
  this.render('footer', {to: "footer"});
}, {
    name: 'catalog.item'
});
