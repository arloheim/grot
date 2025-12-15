import cors from 'cors';
import express from 'express';
import winston from 'winston';

import { logRequest, respondWithError } from './middleware.js';
import { createAgencyRouter } from "./controllers/agencies.js";
import { createModalityRouter } from "./controllers/modalities.js";
import { createNodeRouter } from "./controllers/nodes.js";
import { createRoutesRouter } from "./controllers/routes.js";
import { createTransfersRouter } from "./controllers/transfers.js";
import { createServicesRouter } from "./controllers/services.js";
import { createNotificationsRouter } from "./controllers/notifications.js";
import { createPlannerRouter } from './controllers/planner.js';


// Create the Winston logger
export function createLogger() {
  // Create the logger
  const logger = winston.createLogger({
    level: 'http',
    format: winston.format.combine(
      winston.format.errors({stack: true}),
      winston.format.timestamp({format: 'HH:mm:ss.SSS'}),
      winston.format.cli({level: true, colors: {http: 'gray', info: 'green', warn: 'yellow', error: 'red'}}),
      winston.format.printf(info => `[${info.timestamp}] ${info.level} ${info.message}`)
    ),
    transports: [new winston.transports.Console()],
    exitOnError: false
  });

  return logger;
}

// Create the Express app
export function createApp(logger, feed) {
  // Create the app
  const app = express();
  app.locals.logger = logger;
  app.locals.feed = feed;

  // Add the middlewares to the app
  app.use(logRequest(logger));
  app.use(cors());

  // Create the timetable routes
  app.use('/timetable/agencies', createAgencyRouter(app));
  app.use('/timetable/modalities', createModalityRouter(app));
  app.use('/timetable/nodes', createNodeRouter(app));
  app.use('/timetable/routes', createRoutesRouter(app));
  app.use('/timetable/transfers', createTransfersRouter(app));
  app.use('/timetable/services', createServicesRouter(app));
  app.use('/timetable/notifications', createNotificationsRouter(app));
  app.use('/planner', createPlannerRouter(app));

  // Add the error middleware to the app
  app.use(respondWithError(logger));

  return app;
}