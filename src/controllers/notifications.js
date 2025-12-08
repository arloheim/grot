import express from 'express';
import httpError from 'http-errors';

import { catchError } from '../middleware.js';


// Create the router for notifications
export function createNotificationsRouter(app) {
  // Create the router
  const router = express.Router();

  // Fetch a notification from a parameter
  router.param('notificationId', async function(req, res, next, notificationId) {
    try {
      // Get the notification
      req._notification = app.locals.feed.getNotification(notificationId);
      if (req._notification === undefined)
        return next(httpError.NotFound(`Could not find notification with identifier ${JSON.stringify(notificationId)}`));

      // Handle the request
      next();
    } catch (err) {
      // Handle the error
      next(err);
    }
  });

  // Add the list notifications route
  router.get('/', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Get the notifications
    const notifications = app.locals.feed.getNotifications();

    // Respond with the notifications
    return res.json(notifications.map(notification => notification.toJSON({language})));
  }));

  // Add the get notification route
  router.get('/:notificationId', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Respond with the notification
    return res.json(req._notification.toJSON({language}));
  }));

  // Return the router
  return router;
}
