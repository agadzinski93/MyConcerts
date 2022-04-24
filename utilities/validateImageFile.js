const express = require('express');
const ExpressError = require("./ExpressError");

function fileFilter (req, file, cb) {
    if (file.mimetype === "image/png" || 
    file.mimetype === "image/jpeg" || 
    file.mimetype === "image/gif" ||
    file.mimetype === "image/tiff" ||
    file.mimetype === "image/webp") {
        cb(null, true);
    }
    else {
        cb(new ExpressError("Image must be a JPG, PNG, GIF, TIF, or WEBP", 400), false);
    }
}

module.exports = fileFilter;