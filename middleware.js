const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

// 🔐 Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  console.log("Requested Path:", req.path, "| Full URL:", req.originalUrl);
  console.log("User:", req.user);

  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

// 💾 Save redirect URL (for post-login redirect)
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// 🛡️ Check if current user is listing owner
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "🚫 You don't have permission to do that.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// 🛡️ Check if current user is review author
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "🚫 You are not the author of this review.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
