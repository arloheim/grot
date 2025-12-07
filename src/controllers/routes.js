import express from 'express';
import httpError from 'http-errors';

import { catchError } from '../middleware.js';


// Create the router for routes
export function createRoutesRouter(app) {
  // Create the router
  const router = express.Router();

  // Fetch a route from a parameter
  router.param('routeId', async function(req, res, next, routeId) {
    try {
      // Get the route
      req._route = app.locals.feed.getRoute(routeId);
      if (req._route === undefined)
        return next(httpError.NotFound(`Could not find route with identifier ${JSON.stringify(routeId)}`));

      // Handle the request
      next();
    } catch (err) {
      // Handle the error
      next(err);
    }
  });

  // Add the list routes route
  router.get('/', catchError(async function(req, res, next) {
    // Get the routes
    const routes = app.locals.feed.getRoutes();

    // Respond with the routes
    return res.json(routes.map(route => route.toJSON()));
  }));

  // Add the get route route
  router.get('/:routeId', catchError(async function(req, res, next) {
    // Respond with the route
    return res.json(req._route.toJSON());
  }));

  // Add the get route services route
  router.get('/:routeId/services', catchError(async function(req, res, next) {
    // Get the services
    const services = req._route.services;

    // Respond with the services
    return res.json(services.toJSON());
  }));

  // Add the get route notifications route
  router.get('/:routeId/notifications', catchError(async function(req, res, next) {
    // Get the notifications
    const notifications = req._route.notifications;

    // Respond with the notifications
    return res.json(notifications.map(notification => notification.toJSON()));
  }));

  // Add the get route notifications route
  router.get('/:routeId/stops/:nodeId', catchError(async function(req, res, next) {
    // Get the node
    req._node = app.locals.feed.getNode(req.params.nodeId);
    if (req._node === undefined)
      return next(httpError.NotFound(`Could not find node with identifier ${JSON.stringify(nodeId)}`));

    // Get the stops
    const stops = req._route.getStopsAtNode(req._node);

    // Respond with the stops
    return res.json(stops.map(stop => stop.toJSON()));
  }));

  // Return the router
  return router;
}