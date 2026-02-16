const Listing = require("./Models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema } = require("./schema.js");
const Review = require("./Models/review.js"); 

module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req.user);
    console.log(req.path, ".." , req.originalUrl);
    if(!req.isAuthenticated())
    {
        req.session.redirectUrl = req.originalUrl ;
        req.flash("error" , "you must be logged in to create listing");
        res.redirect("/login");
    }
    else
    {
        next();
    }
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl = req.session.redirectUrl ;
    }
    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params ;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id))
    {
        req.flash("error" , "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    else{
        next();
    }
};

//validate listing 
module.exports.validateListing = (req,res,next)=>{
    console.log(req.body);
    let {error , value} = listingSchema.validate(req.body); 
    if(error)
    {
        console.log(error.details[0].message);
        throw new ExpressError(400,error);
    }
    else
    {
        next();
    }
};


//validate review
module.exports.validateReview = (req,res,next)=>{
    console.log(req.body);
    let {error , value} = reviewSchema.validate(req.body); 
    if(error)
    {
        console.log(error.details[0].message);
        throw new ExpressError(400,error);
    }
    else
    {
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id ,  reviewId } = req.params ;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id))
    {
        req.flash("error" , "You did not create this review...");
        return res.redirect(`/listings/${id}`);
    }
    else{
        next();
    }
};