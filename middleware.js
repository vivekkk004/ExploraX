const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// Middleware to check if user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to perform this action!");
        return res.redirect("/login");
    }
    next();
};

// Middleware to save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Middleware to check if the current user is the owner of a listing
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to modify this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Middleware to validate listing input using Joi schema
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    next();
};

// Middleware to validate review input using Joi schema
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    next();
};

// Middleware to check if the current user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to delete this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
