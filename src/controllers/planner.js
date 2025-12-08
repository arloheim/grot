import dayjs from 'dayjs';
import express from 'express';

import { catchError } from '../middleware.js';

import RaptorAlgorithm from '../planner/algorithm.js';


// Create the router for the planner
export function createPlannerRouter(app) {
  // Create the router
  const router = express.Router();

  // Add the planner route
  router.get('/', catchError(async function(req, res, next) {
    // Parse the query
    const {from, to, date, language} = req.query;
    const fromNode = app.locals.feed.getNode(from);
    const toNode = app.locals.feed.getNode(to);
    const actualDate = date !== undefined ? dayjs(date) : dayjs();    

    // Get the journeys
    const algo = new RaptorAlgorithm(app.locals.feed);
    const journeys = algo.calculate(fromNode, toNode, actualDate);

    // Respond with the journeys
    const json = {
      from: fromNode.toJSON({language}),
      to: toNode.toJSON({language}),
      date: actualDate.format('YYYY-MM-DDTHH:mm'),
      journeys: journeys.map(journey => journey.toJSON({language})),
    };

    return res.json(json);
  }));

  // Return the router
  return router;
}