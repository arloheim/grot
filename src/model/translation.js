import { Agency } from "./agency.js";
import { Modality } from "./modality.js";
import { Node } from "./node.js";
import { Notification } from "./notification.js";
import { NotificationType } from "./notificationType.js";
import { Route } from "./route.js";
import { RouteStop } from "./routeStop.js";
import { Service } from "./service.js";
import { Transfer } from "./transfer.js";


// Class that defines a translation in a feed
export class Translation
{
  // Constructor
  constructor(feed, id, table) {
    this._feed = feed;

    this.id = id;
    this.table = table;
  }

  // Apply the translation to the specified object
  apply(object, key) {
    // Get the table key for the object
    const tableKeys = this._getTableKeys(object);
    if (tableKeys === undefined)
      return undefined;

    // Get the value from the translation
    return this._getNestedKey(this.table, [...tableKeys, key]) ?? object[key];
  }

  // Return the table keys for the specified object
  _getTableKeys(object) {
    if (object instanceof Agency)
      return ['agencies', object.id];
    else if (object instanceof Modality)
      return ['modalities', object.id];
    else if (object instanceof Node)
      return ['nodes', object.id];
    else if (object instanceof Route)
      return ['routes', object.id];
    else if (object instanceof RouteStop)
      return ['routes', object._route.id, 'stops', object.sequence];
    else if (object instanceof Transfer)
      return ['transfers', object.id];
    else if (object instanceof Service)
      return ['services', object.id];
    else if (object instanceof NotificationType)
      return ['notificationTypes', object.id];
    else if (object instanceof Notification)
      return ['notifications', object.id];
    else
      return undefined;
  }

  // Return a nested key in the specified object
  _getNestedKey(object, keys) {
    return keys.reduce((nestedObject, key) => {
      if (nestedObject !== undefined && (Array.isArray(nestedObject) && Number.isInteger(key) || Object.prototype.hasOwnProperty.call(nestedObject, key)))
        return nestedObject[key];
      else
        return undefined;
    }, object);
  }
}