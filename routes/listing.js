const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../Models/listing.js");
const passport = require("passport");
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

//Listings
router.route("/")
    .get( wrapAsync(listingController.index)) //Index route to print all listings
    .post( isLoggedIn, validateListing, upload.single('listing[image]'),wrapAsync(listingController.createListing) ); //CREATE Route

//New  Route
router.get("/new", isLoggedIn , listingController.renderNewForm);

router.route("/:id")
    .get( wrapAsync( listingController.showListing)) //show route READ
    .put( isLoggedIn , isOwner , upload.single('listing[image]') ,validateListing, wrapAsync(listingController.updateListing)) //update route
    .delete( isLoggedIn ,isOwner, wrapAsync(listingController.destroyListing)); //delete route

//edit route
router.get("/:id/edit", isLoggedIn, isOwner ,wrapAsync( listingController.renderEditForm));

module.exports = router ;
