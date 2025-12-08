import fs from 'fs/promises';
import path from 'path';

import { load as parseToml, SyntaxParseError } from 'js-toml';

import { Agency } from "./model/agency.js";
import { Feed } from './model/feed.js';
import { Modality } from "./model/modality.js";
import { Node } from "./model/node.js";
import { NodeServiceArray } from './model/nodeServiceArray.js';
import { Notification } from "./model/notification.js";
import { NotificationType } from "./model/notificationType.js";
import { Route } from "./model/route.js";
import { RouteServiceArray } from './model/routeServiceArray.js';
import { RouteStop } from "./model/routeStop.js";
import { Service } from "./model/service.js";
import { Transfer } from "./model/transfer.js";
import { Translation } from './model/translation.js';


// Parse a feed from a set of TOML files a tthe specified base path
export async function parseFeed(logger, basePath) {
  // Parse the feed file
  const feedData = await readFile(logger, null, path.join(basePath, 'feed.toml'));

  // Create the feed
  const feed = new Feed(feedData);

  // Parse the files
  feed.agencies = await readFile(logger, feed, path.join(basePath, 'agencies.toml'), parseAgency);
  feed.modalities = await readFile(logger, feed, path.join(basePath, 'modalities.toml'), parseModality);
  feed.nodes = await readFile(logger, feed, path.join(basePath, 'nodes.toml'), parseNode);
  feed.routes = await readFile(logger, feed, path.join(basePath, 'routes.toml'), parseRoute);
  feed.transfers = await readFile(logger, feed, path.join(basePath, 'transfers.toml'), parseTransfer);
  feed.services = await readFile(logger, feed, path.join(basePath, 'services.toml'), parseService);
  feed.nodeServices = await readFile(logger, feed, path.join(basePath, 'node_services.toml'), parseNodeServiceArray);
  feed.routeServices = await readFile(logger, feed, path.join(basePath, 'route_services.toml'), parseRouteServiceArray);
  feed.notificationTypes = await readFile(logger, feed, path.join(basePath, 'notification_types.toml'), parseNotificationType);
  feed.notifications = await readFile(logger, feed, path.join(basePath, 'notifications.toml'), parseNotification);
  feed.translations = await readFile(logger, feed, path.join(basePath, 'translations.toml'), parseTranslation);
  feed._postLoad();

  return feed;
}


// Read and parse the TOML file at the specified path
async function readFile(logger, data, path, parser = undefined, options = {}) {
  try {
    // Read and parse the TOML file
    const file = await fs.readFile(path, 'utf-8');
    const entries = parseToml(file);

    // Parse the entries
    if (parser !== undefined)
      return new Map(parseToMap(entries, (key, value) => parser(logger, data, key, value)));
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
function parseToMap(object, callbackFn) {
  const keys = Object.keys(object);
  const map = new Map();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    map.set(key, callbackFn(key, object[key]));
  }
  return map;
}


// Parse an agency from an object
function parseAgency(logger, feed, id, agencyData) {
  // Create a new agency
  return new Agency(feed, id, agencyData);
}

// Parse a modality from an object
function parseModality(logger, feed, id, modalityData) {
  // Create a new modality
  return new Modality(feed, id, modalityData);
}

// Parse a node from an object
function parseNode(logger, feed, id, nodeData) {
  // Fetch the modality of the node
  if (nodeData.modality !== undefined) {
    nodeData.modality = feed.getModality(nodeData.modality);
    if (nodeData.modality === undefined)
      logger.warn(`Undefined modality "${nodeData.modality}" in node with id "${id}"`);
  }

  // Create a new node
  return new Node(feed, id, nodeData);
}

// Parse a route from an object
function parseRoute(logger, feed, id, routeData) {
  // Fetch the agency of the route
  routeData.agency = feed.getAgency(routeData.agency);
  if (routeData.agency === undefined)
    logger.warn(`Undefined agency "${routeData.agency}" in route with id "${id}"`);

  // Fetch the modality of the route
  routeData.modality = feed.getModality(routeData.modality);
  if (routeData.modality === undefined)
    logger.warn(`Undefined modality "${routeData.modality}" in route with id "${id}"`);

  // Create a new route
  const route = new Route(feed, id, routeData);

  // Parse the stops of the route
  route.stops = [...parseToMap(routeData.stops, (value, key) => parseRouteStop(logger, feed, route, value, key)).values()].toSorted((a, b) => a.sequence - b.sequence);
  route._postLoad();

  return route;
}

// Parse a route stop from an object
function parseRouteStop(logger, feed, route, sequence, stopData) {
  // Fetch the node of the route stop
  stopData.node = feed.getNode(stopData.node);

  // Create a new route stop
  return new RouteStop(feed, route, sequence, stopData);
}

// Parse a transfer from an object
function parseTransfer(logger, feed, id, transferData) {
  // Fetch the nodes of the transfer
  transferData.from = feed.getNode(transferData.from);
  transferData.to = feed.getNode(transferData.to);

  // Create a new transfer
  return new Transfer(feed, id, transferData);
}

// Parse a service type from an object
function parseService(logger, feed, id, serviceData) {
  // Fetch the agency of the service
  if (serviceData.agency !== undefined)
    serviceData.agency = feed.getAgency(serviceData.agency);

  // Create a new service
  return new Service(feed, id, serviceData);
}

// Parse an array of node services from an array
function parseNodeServiceArray(logger, feed, id, services) {
  // Fetch the node and services of the service collection
  const node = feed.nodes[id];
  services = services.map(service => feed.getService(service));

  // Create a new node service collection
  return new NodeServiceArray(node, services);
}

// Parse an array of route services from an array
function parseRouteServiceArray(logger, feed, id, services) {
  // Fetch the route and services of the service collection
  const route = feed.routes[id];
  services = services.map(service => feed.getService(service));

  // Create a new route service collection
  return new RouteServiceArray(route, services);
}

// Parse a notification type from an object
function parseNotificationType(logger, feed, id, notificationTypeData) {
  // Create a new notification type
  return new NotificationType(feed, id, notificationTypeData);
}

// Parse a notification from an object
function parseNotification(logger, feed, id, notificationData) {
  // Fetch the type, affected nodes, and affected routes of the notification
  notificationData.type = feed.getNotificationType(notificationData.type);
  notificationData.affectedNodes = notificationData.affectedNodes?.map(n => feed.getNode(n)) ?? [];
  notificationData.affectedRoutes = notificationData.affectedRoutes?.map(r => feed.getRoute(r)) ?? [];

  // Create a new notification
  return new Notification(feed, id, notificationData);
}

// Parse a translation from an object
function parseTranslation(logger, feed, id, table) {
  // Create a new translation
  return new Translation(feed, id, table);
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