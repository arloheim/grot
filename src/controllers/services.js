import express from 'express';
import httpError from 'http-errors';

import { catchError } from '../middleware.js';


// Create the router for services
export function createServicesRouter(app) {
  // Create the router
  const router = express.Router();

  // Fetch a service from a parameter
  router.param('serviceId', async function(req, res, next, serviceId) {
    try {
      // Get the service
      req._service = app.locals.feed.getService(serviceId);
      if (req._service === undefined)
        return next(httpError.NotFound(`Could not find service with identifier ${JSON.stringify(serviceId)}`));

      // Handle the request
      next();
    } catch (err) {
      // Handle the error
      next(err);
    }
  });

  // Add the list services route
  router.get('/', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;
    
    // Get the services
    const services = app.locals.feed.getServices();

    // Respond with the services
    return res.json(services.map(service => service.toJSON({language})));
  }));

  // Add the get service route
  router.get('/:serviceId', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Respond with the service
    return res.json(req._service.toJSON({language}));
  }));

  // Return the router
  return router;
}