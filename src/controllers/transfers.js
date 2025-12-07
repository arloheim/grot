import express from 'express';
import httpError from 'http-errors';

import { catchError } from '../middleware.js';


// Create the router for transfers
export function createTransfersRouter(app) {
  // Create the router
  const router = express.Router();

  // Fetch a transfer from a parameter
  router.param('transferId', async function(req, res, next, transferId) {
    try {
      // Get the transfer
      req._transfer = app.locals.feed.getTransfer(transferId);
      if (req._transfer === undefined)
        return next(httpError.NotFound(`Could not find transfer with identifier ${JSON.stringify(transferId)}`));

      // Handle the request
      next();
    } catch (err) {
      // Handle the error
      next(err);
    }
  });

  // Add the list transfers route
  router.get('/', catchError(async function(req, res, next) {
    // Get the transfers
    const transfers = app.locals.feed.getTransfers();

    // Respond with the transfers
    return res.json(transfers.map(transfer => transfer.toJSON()));
  }));

  // Add the get transfer route
  router.get('/:transferId', catchError(async function(req, res, next) {
    // Respond with the transfer
    return res.json(req._transfer.toJSON());
  }));

  // Return the router
  return router;
}