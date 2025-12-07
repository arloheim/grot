import http from 'http';

import { createApp, createLogger } from './app.js'
import { parseFeed, ParserError } from './parser.js';


// Main function
async function main() {
  // Create the logger
  const logger = createLogger();

  try {
    // Parse the feed
    logger.info("Loading transit feed...");
    const feed = await parseFeed(logger, './data');

    // Log the feed information
    logger.info(`- ${feed.agencies.length} agencies defined`);
    logger.info(`- ${feed.modalities.length} modalities defined`);
    logger.info(`- ${feed.nodes.length} nodes defined`);
    logger.info(`- ${feed.transfers.length} transfers defined`);
    logger.info(`- ${feed.routes.length} routes defined`);
    logger.info(`- ${feed.services.length} services defined`);
    logger.info(`- ${feed.nodeServices.length} node services defined`);
    logger.info(`- ${feed.routeServices.length} route services defined`);
    logger.info(`- ${feed.notificationTypes.length} notification types defined`);
    logger.info(`- ${feed.notifications.length} notifications defined`);

    // Create the app
    const app = createApp(logger);

    // Run the server
    const server = http.createServer(app);

    // Event handler for when the server has started listening
    server.on('listening', () => {
      // Log the listening address and port
      var address = server.address();
      logger.info(`Server listening at ${address.address}:${address.port}`)

      // Set up the SIGINT signal
      process.on('SIGINT', () => {
        // Close the server
        logger.info('Received SIGINT, closing the server');
        server.close();

        // Exit the process
        process.exit();
      });

      // Set up the SIGTERM signal
      process.on('SIGTERM', () => {
        // Close the server
        logger.info('Received SIGTERM, closing the server');
        server.close();

        // Exit the process
        process.exit();
      });
    });

    // Event handler for when the server has encountered an error
    server.on('error', e => {
      // Log the error
      logger.error(e.message);
      server.close();
      process.exit();
    });

    // Event handler for when the server has been closed
    server.on('close', () => {
      // Log that the server has been closed
      logger.info('Server closed');
    });

    // Start the server
    server.listen(8080);
  } catch (e) {
    // Check if the error is a parser error
    if (e instanceof ParserError) {
      // Log the parser error
      logger.error(e);
    } else {
      // Rethrow the error
      throw e;
    }
  }
}


// Execute the main function
main().catch(err => {
  console.error("An unexpected error occurred while running the app");
  console.error(err);
});
