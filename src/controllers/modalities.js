import express from 'express';
import httpError from 'http-errors';

import { catchError } from '../middleware.js';


// Create the router for modalities
export function createModalityRouter(app) {
  // Create the router
  const router = express.Router();

  // Fetch a modality from a parameter
  router.param('modalityId', async function(req, res, next, modalityId) {
    try {
      // Get the modality
      req._modality = app.locals.feed.getModality(modalityId);
      if (req._modality === undefined)
        return next(httpError.NotFound(`Could not find modality with identifier ${JSON.stringify(modalityId)}`));

      // Handle the request
      next();
    } catch (err) {
      // Handle the error
      next(err);
    }
  });

  // Add the list modalities route
  router.get('/', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Get the modalities
    const modalities = app.locals.feed.getModalities();

    // Respond with the modalities
    return res.json(modalities.map(modality => modality.toJSON({language})));
  }));

  // Add the get modality route
  router.get('/:modalityId', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Respond with the modality
    return res.json(req._modality.toJSON({language}));
  }));

  // Return the router
  return router;
}