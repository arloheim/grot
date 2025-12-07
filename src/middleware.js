// Return middleware that wraps another middleware function in a try-catch block
export function catchError(middleware) {
  return async function(req, res, next) {
    try {
      return await middleware(req, res, next);
    } catch (err) {
      return next(err);
    }
  };
};

// Return middleware that logs a request
export function logRequest(logger) {
  return function(req, res, next) {
    logger.http(`HTTP request from ${req.ip}: "${req.method} ${req.originalUrl}"`);
    return next();
  };
};

// Return middleware that responds with an error
export function respondWithError(logger) {
  return function(err, req, res, next) {
    logger.error(`During request "${req.method} ${req.originalUrl}" an instance of ${err.name} was thrown: ${err.message}`);
    console.error(err);

    if (req.headersSent)
      return next(err);

    res.status(err.status ?? 500);
    res.json({error: err.name, message: err.message});
  };
};
