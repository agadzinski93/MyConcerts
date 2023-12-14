# My Concerts - Host Your Own Concert

Straight-forward application that allows users to create their own concerts and subscribers to their account will receive auto-generated HTML emails notifying them that a new concert has been created.

## Installation Requirements
* [NodeJS](https://nodejs.org/en/download) (v16 or later)
* [MongoDB Compass](https://www.mongodb.com/products/tools/compass) and/or [MongoDB Atlas](https://www.mongodb.com/atlas/database) to handle local and remote DB calls

    * Doesn't matter one way or another, but you'll need at least one set of credentials for development and production (you can link to the same DB if you wish)

## Database Setup
For MongoDB, you generally don't need to create the collections ahead of time as this is done dynamically. However, you can choose to do so, simply name the collections:

* concerts
* users
* reviews

## Additional Setup
* You need a Cloudinary account with an account name, API key, and a secret

* You will need a Mapbox account with a valid API Token

## Environment Variables
`NODE_ENV` - 'development' or 'production'

`PORT`

`CLOUDINARY_CLOUD_NAME` - Name of your Cloudinary account

`CLOUDINARY_KEY` - Your Cloudinary API key

`CLOUDINARY_SECRET` - Your Cloudinary secret

`MAPBOX_TOKEN` - Mapbox API Token

`MONGODB_URI` - URI/Connection String for Mongo database

`MONGO_SECRET`

`EMAIL_HOST` - Hostname (domain or IP) for email server

`EMAIL_PORT`

`EMAIL_USER` - Username for email account

`EMAIL_PASS` - Password to email account

`DEFAULT_CONCERT_IMG` - Cloundinary Filename for Default Concert Image. This is used during seeding.

## Final Steps
All done. Just run `npm install` followed by `npm run dev` and everything should be good to go!