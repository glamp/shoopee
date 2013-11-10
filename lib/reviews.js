var _ = require('underscore');

var reviews = [
    { reviewer: "Sandra Bullock", name: "Peter Venkman", quote: "This guy is the coolest", rating: 100 },
    { reviewer: "James Spader", name: "Ted Kennedy", quote: "This guy was a tool.", rating: 20 },
    { reviewer: "Meg Ryan", name: "Bill", quote: "He had a most excellent adventure", rating: 92 }
  ];
 

module.exports = {
  all: function(fn) {
         fn(null, reviews);
       },
  find: function(filter, fn) {
          if (_.keys(filter).length==0) {
            this.all(fn);
          } else {
            fn(null, _.where(reviews, filter));
          }
        },
  findOne: function(filter, fn) {
          fn(null, _.findWhere(reviews, filter));
        },
  add: function(newReview, fn) {
         reviews.push(newReview);
         fn(null);
        }
};
