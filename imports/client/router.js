import { Router } from 'meteor/iron:router';

/// routing
Router.configure({
  layoutTemplate: 'main_Layout'
});

Router.route('/test', function () { // area 51 testing
  //this.render('navbar', {to:"navbar"});
  this.render('test', {to:"main"});
});

Router.route('/', function () {
  this.render('navbar', {to:"navbar"});
  this.render('welcome', {to:"main"});
  this.render('footer', {to:"footer"});
});

Router.route('/aboutus', function () {
  this.render('navbar', {to:"navbar"});
  this.render('aboutus', {to:"main"});
  this.render('footer', {to:"footer"});
});

Router.route('/login', function () {
  this.render('navbar', {to:"navbar"});
  this.render('login', {to:"main",});
  this.render('footer', {to:"footer"});
});

Router.route('/images', function () {
  this.render('navbar', {to:"navbar"});
  this.render('images', {to:"main"}); // No footer due to infinite scroll
});

Router.route('/image/:_id', function () {
  this.render('navbar', {to:"navbar"});
  this.render('image', {
    to:"main",
    data: function(){
      return Images.findOne({_id:this.params._id});
    }
  });
  this.render('footer', {to:"footer"});
});
