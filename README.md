# photos.filmaj.ca

A site to store and show off pictures I've taken over the years.

Hosted on https://photos.filmaj.ca.

## Overview

This site is built with [arc.codes][arc], an excellent framework for building websites on top of serverless
architectures. To get a mile-high overview of the various components making up the site, check out the `app.arc`
file. A majority of the components in the `app.arc` file map to various Lambdas, and each Lambda is revised
separately under the `src/` directory.

The HTML from the site is served via a series of AWS Lambda functions, with each Lambda serving one HTTP
route. The routes are neatly laid out in the `app.arc` file under the `@http` section, and there are two
important routes:

1. `GET /`: the home page; the code for this route (Lambda) exists under `src/http/get-index`.
2. `GET /*`: the 'catch-all' route - everything other than the home page is served by this route (Lambda) and
   its code exists under `src/http/get-catchall`.

The site itself functions as two routes: the home page, and everything else. The catch-all route serves two "views": the photo-album view, and the picture detail view.

There are more components working in the background that are key to this site's functionality, however:

- A single S3 bucket stores all of my pictures. This is a special bucket, with special permissions, and a single event notification.
  - Some of the special permissions for this bucket are set up using an [Arc plugin][plugin], as it enables some features which are beyond the out-of-the-box scope of [`arc`][arc]. The code for this plugin is under `src/plugins/bucket-permissions`.
  - This bucket has an [S3 Event Notification][s3-events] configured on it to trigger an AWS SNS Topic whenever a new object is created in the bucket. [`arc`][arc] supports SNS topics out of the box via its `@events` API...
  - ... and there is one `@events` configured in this app (as you can see in `app.arc`) called `s3upload`. Code for this event's Lambda is found under `src/events/s3upload`, and this event is triggered every time an object is uploaded to this S3 bucket.
  - This event Lambda does a bunch of cool things:
    - It extracts EXIF data from uploaded pictures and stores them in a DynamoDB table for easy access throughout this app (this DynamoDB table is encapsulated via `arc`'s `@tables` API).
    - It creates thumbnail and preview-sized versions of uploaded images and stores them alongside the original pictures.

[arc]: https://arc.codes
[plugin]: https://arc.codes/docs/en/guides/plugins/overview
[s3-events]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/NotificationHowTo.html
