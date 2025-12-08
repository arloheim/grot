import express from 'express';
import httpError from 'http-errors';

import { catchError } from '../middleware.js';


// Create the router for nodes
export function createNodeRouter(app) {
  // Create the router
  const router = express.Router();

  // Fetch a node from a parameter
  router.param('nodeId', async function(req, res, next, nodeId) {
    try {
      // Get the node
      req._node = app.locals.feed.getNode(nodeId);
      if (req._node === undefined)
        return next(httpError.NotFound(`Could not find node with identifier ${JSON.stringify(nodeId)}`));

      // Handle the request
      next();
    } catch (err) {
      // Handle the error
      next(err);
    }
  });

  // Add the list nodes route
  router.get('/', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Get the nodes
    const nodes = app.locals.feed.getNodes();

    // Respond with the nodes
    return res.json(nodes.map(node => node.toJSON({language})));
  }));

  // Add the get node route
  router.get('/:nodeId', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Respond with the node
    return res.json(req._node.toJSON({language}));
  }));

  // Add the get node routes route
  router.get('/:nodeId/routes', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Get the routes
    const routes = req._node.getRoutes();

    // Respond with the routes
    return res.json(routes.map(route => route.toJSON({language})));
  }));

  // Add the get node transfers route
  router.get('/:nodeId/transfers', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Get the transfers
    const transfers = req._node.getTransfers();

    // Respond with the transfers
    return res.json(transfers.map(transfer => transfer.toJSON({language})));
  }));

  // Add the get node services route
  router.get('/:nodeId/services', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Get the services
    const services = req._node.getServices();

    // Respond with the services
    return res.json(services.toJSON({language}));
  }));

  // Add the get node notifications route
  router.get('/:nodeId/notifications', catchError(async function(req, res, next) {
    // Parse the query
    const {language} = req.query;

    // Respond with the notifications
    return res.json(notifications.map(notification => notification.toJSON({language})));
  }));

  // Return the router
  return router;
}