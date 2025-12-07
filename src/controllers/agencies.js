import express from 'express';
import httpError from 'http-errors';

import { catchError } from '../middleware.js';


// Create the router for agencies
export function createAgencyRouter(app) {
  // Create the router
  const router = express.Router();

  // Fetch an agency from a parameter
  router.param('agencyId', async function(req, res, next, agencyId) {
    try {
      // Get the agency
      req._agency = app.locals.feed.getAgency(agencyId);
      if (req._agency === undefined)
        return next(httpError.NotFound(`Could not find agency with identifier ${JSON.stringify(agencyId)}`));

      // Handle the request
      next();
    } catch (err) {
      // Handle the error
      next(err);
    }
  });

  // Add the list agencies route
  router.get('/', catchError(async function(req, res, next) {
    // Get the agencies
    const agencies = app.locals.feed.getAgencies();

    // Respond with the agencies
    return res.json(agencies.map(agency => agency.toJSON()));
  }));

  // Add the get agency route
  router.get('/:agencyId', catchError(async function(req, res, next) {
    // Respond with the agency
    return res.json(req._agency.toJSON());
  }));

  // Add the list agency routes route
  router.get('/:agencyId/routes', catchError(async function(req, res, next) {
    // Get the routes
    const routes = req._agency.routes;

    // Respond with the routes
    return res.json(routes.map(route => route.toJSON()));
  }));

  // Return the router
  return router;
}