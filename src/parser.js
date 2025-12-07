import fs from 'fs/promises';
import path from 'path';

import { load as parseToml, SyntaxParseError } from 'js-toml';

import Feed from './model/feed.js';
import Agency from './model/agency.js';
import Modality from './model/modality.js';
import Node from './model/node.js';
import Transfer from './model/transfer.js';
import Route from './model/route.js';
import RouteStop from './model/routeStop.js';
import Service from './model/service.js';
import NodeServiceArray from './model/nodeServiceArray.js';
import RouteServiceArray from './model/routeServiceArray.js';
import NotificationType from './model/notificationType.js';
import Notification from './model/notification.js';
import Translation from './model/translation.js';


// Parse a feed from a set of TOML files a tthe specified base path
export async function parseFeed(logger, basePath) {
  // Parse the feed file
  const feedData = await _readFile(logger, null, path.join(basePath, 'feed.toml'));

  // Create the feed
  const feed = new Feed(feedData);

  // Parse the files
  feed.agencies = await _readFile(logger, feed, path.join(basePath, 'agencies.toml'), _parseAgency);
  feed.modalities = await _readFile(logger, feed, path.join(basePath, 'modalities.toml'), _parseModality);
  feed.nodes = await _readFile(logger, feed, path.join(basePath, 'nodes.toml'), _parseNode);
  feed.routes = await _readFile(logger, feed, path.join(basePath, 'routes.toml'), _parseRoute);
  feed.transfers = await _readFile(logger, feed, path.join(basePath, 'transfers.toml'), _parseTransfer);
  feed.services = await _readFile(logger, feed, path.join(basePath, 'services.toml'), _parseService);
  feed.nodeServices = await _readFile(logger, feed, path.join(basePath, 'node_services.toml'), _parseNodeServiceArray);
  feed.routeServices = await _readFile(logger, feed, path.join(basePath, 'route_services.toml'), _parseRouteServiceArray);
  feed.notificationTypes = await _readFile(logger, feed, path.join(basePath, 'notification_types.toml'), _parseNotificationType);
  feed.notifications = await _readFile(logger, feed, path.join(basePath, 'notifications.toml'), _parseNotification);
  feed.translations = await _readFile(logger, feed, path.join(basePath, 'translations.toml'), _parseTranslation);

  // Create the node search index
  feed._createNodesSearchIndex();

  return feed;
}


// Read and parse the TOML file at the specified path
async function _readFile(logger, data, path, parser = undefined, options = {}) {
  try {
    // Read and parse the TOML file
    const file = await fs.readFile(path, 'utf-8');
    const entries = parseToml(file);

    // Parse the entries
    if (parser !== undefined)
      return new Map(_parseToMap(entries, (key, value) => parser(logger, data, key, value)));
    else
      return entries;
  } catch (e) {
    // Check if the file could not be found
    if (!(options.required ?? false) && (e.code === 'ENOENT' || e.code === 'EACCES')) {
      // Return an empty object
      return {};
    } else if (e instanceof SyntaxParseError) {
      throw new ParserError(`Syntax error in file "${path}": ${e.message}`, {cause: e});
    } else {
      // Rethrow the error
      throw e;
    }
  }
}

// Parses an object into a map using the specified callback function
function _parseToMap(object, callbackFn) {
  const keys = Object.keys(object);
  const map = new Map();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    map.set(key, callbackFn(key, object[key]));
  }
  return map;
}


// Parse an agency from an object
function _parseAgency(logger, feed, id, agency) {
  // Create a new agency
  return new Agency(feed, id, agency);
}

// Parse a modality from an object
function _parseModality(logger, feed, id, modality) {
  // Create a new modality
  return new Modality(feed, id, modality);
}

// Parse a node from an object
function _parseNode(logger, feed, id, node) {
  // Fetch the modality of the node
  if (node.modality !== undefined) {
    node.modality = feed.getModality(node.modality);
    if (node.modality === undefined)
      logger.warn(`Undefined modality "${node.modality}" in node with id "${id}"`);
  }

  // Create a new node
  return new Node(feed, id, node);
}

// Parse a route from an object
function _parseRoute(logger, feed, id, route) {
  // Fetch the agency of the route
  route.agency = feed.getAgency(route.agency);
  if (route.agency === undefined)
    logger.warn(`Undefined agency "${route.agency}" in route with id "${id}"`);

  // Fetch the modality of the route
  route.modality = feed.getModality(route.modality);
  if (route.modality === undefined)
    logger.warn(`Undefined modality "${route.modality}" in route with id "${id}"`);

  // Parse the stops of the route
  route.stops = [..._parseToMap(route.stops, (value, key) => _parseRouteStop(logger, feed, value, key)).values()].toSorted((a, b) => a.sequence - b.sequence);

  // Create a new route
  return new Route(feed, id, route);
}

// Parse a route stop from an object
function _parseRouteStop(logger, feed, sequence, stop) {
  // Fetch the node of the route stop
  stop.node = feed.getNode(stop.node);

  // Create a new route stop
  return new RouteStop(feed, {sequence, ...stop});
}

// Parse a transfer from an object
function _parseTransfer(logger, feed, id, transfer) {
  // Fetch the nodes of the transfer
  transfer.between = feed.getNode(transfer.between);
  transfer.and = feed.getNode(transfer.and);

  // Create a new transfer
  return new Transfer(feed, id, transfer);
}

// Parse a service type from an object
function _parseService(logger, feed, id, service) {
  // Fetch the agency of the service
  if (service.agency !== undefined)
    service.agency = feed.getAgency(service.agency);

  // Create a new service
  return new Service(feed, id, service);
}

// Parse an array of node services from an array
function _parseNodeServiceArray(logger, feed, id, services) {
  // Fetch the node and services of the service collection
  const node = feed.nodes[id];
  services = services.map(service => feed.getService(service));

  // Create a new node service collection
  return new NodeServiceArray(node, services);
}

// Parse an array of route services from an array
function _parseRouteServiceArray(logger, feed, id, services) {
  // Fetch the route and services of the service collection
  const route = feed.routes[id];
  services = services.map(service => feed.getService(service));

  // Create a new route service collection
  return new RouteServiceArray(route, services);
}

// Parse a notification type from an object
function _parseNotificationType(logger, feed, id, notificationType) {
  // Create a new notification type
  return new NotificationType(feed, id, notificationType);
}

// Parse a notification from an object
function _parseNotification(logger, feed, id, notification) {
  // Fetch the type, affected nodes, and affected routes of the notification
  notification.type = feed.getNotificationType(notification.type);
  notification.affectedNodes = notification.affectedNodes?.map(n => feed.getNode(n)) ?? [];
  notification.affectedRoutes = notification.affectedRoutes?.map(r => feed.getRoute(r)) ?? [];

  // Create a new notification
  return new Notification(feed, id, notification);
}

// Parse a translation from an object
function _parseTranslation(logger, feed, id, translation) {
  // Create a new translation
  return new Translation(feed, id, translation);
}


// Class that defines a parser error
export class ParserError extends Error
{
  // Constructor
  constructor(message, options) {
    super(message, options);
    this.name = 'ParserError';
  }
}