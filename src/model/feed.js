import MiniSearch from 'minisearch';


// Class that defines a feed
export default class Feed
{
  // Constructor
  constructor(data) {
    if (!('version' in data))
      throw new FeedError(`Missing required field "version" in feed`);
    if (!('language' in data))
      throw new FeedError(`Missing required field "language" in feed`);
    if (!('publisherName' in data))
      throw new FeedError(`Missing required field "publisherName" in feed`);
    if (!('publisherUrl' in data))
      throw new FeedError(`Missing required field "publisherUrl" in feed`);

    this.version = data.version;
    this.language = data.language;
    this.publisherName = data.publisherName;
    this.publisherUrl = data.publisherUrl;

    this.agencies = data?.agencies ?? new Map();
    this.modalities = data?.modalities ?? new Map();
    this.nodes = data?.nodes ?? new Map();
    this.routes = data?.routes ?? new Map();
    this.transfers = data?.transfers ?? new Map();
    this.services = data?.services ?? new Map();
    this.nodeServices = data?.nodeServices ?? new Map();
    this.routeServices = data?.routeServices ?? new Map();
    this.notificationTypes = data?.notificationTypes ?? new Map();
    this.notifications = data?.notifications ?? new Map();
    this.translations = data.translations ?? new Map();
  }
  
  // Finalize loading the feed
  _postLoad() {
    // Create the node search index
    this._nodesSearchIndex = new MiniSearch({
      fields: ['name', 'city', 'code'],
      storeFields: ['modality'],
      searchOptions: {prefix: true, fuzzy: 0.1, combineWith: 'AND', boost: {name: 2}, boostDocument: this._boostNodeDocument.bind(this)}
    });
    this._nodesSearchIndex.addAll(this.nodes.values());
  }

  // Function to boost a node document in a search index
  _boostNodeDocument(id, term, storedFields) {
    let modalityIndex = this.modalities.findIndex(m => m.id === storedFields.modality?.id);
    if (storedFields.modality !== undefined && modalityIndex > -1)
      return 0.7 + (this.modalities.size - modalityIndex) / this.modalities.size * 0.3;
    else
      return 0.7;
  }


  // Return the agencies in the feed
  getAgencies(options) {
    return this._applyQueryOptions(this.agencies, options);
  }

  // Return the agency with the specified identifier in the feed
  getAgency(id) {
    if (id === undefined)
      return undefined;
    return this.agencies.get(id);
  }

  // Return the modalities in the feed
  getModalities(options) {
    return this._applyQueryOptions(this.modalities, options);
  }

  // Return the modality with the specified identifier in the feed
  getModality(id) {
    if (id === undefined)
      return undefined;
    return this.modalities.get(id);
  }

  // Return the nodes in the feed
  getNodes(options) {
    return this._applyQueryOptions(this.nodes, options);
  }

  // Return the node with the specified identifier in the feed
  getNode(id) {
    if (id === undefined)
      return undefined;
    return this.nodes.get(id);
  }
  
  // Return the nodes that match the search query in the feed
  searchNodes(query) {
    return this._nodesSearchIndex.search(query).map(result => this.getNode(result.id));
  }

  // Return the routes in the feed
  getRoutes(options) {
    return this._applyQueryOptions(this.routes, options);
  }

  // Return the route with the specified identifier in the feed
  getRoute(id) {
    if (id === undefined)
      return undefined;
    return this.routes.get(id);
  }

  // Return the transfers in the feed
  getTransfers(options) {
    return this._applyQueryOptions(this.transfers, options);
  }

  // Return the transfer with the specified identifier in the feed
  getTransfer(id) {
    if (id === undefined)
      return undefined;

    return this.transfers.get(id);
  }

  // Return the services in the feed
  getServices(options) {
    return this._applyQueryOptions(this.services, options);
  }

  // Return the service with the specified identifier in the feed
  getService(id) {
    if (id === undefined)
      return undefined;
    return this.services.get(id);
  }

  // Return the services for the specified identifier in the feed
  getNodeServices(id) {
    return this.nodeServices.get(id) ?? [];
  }

  // Return the services for the specified identifier in the feed
  getRouteServices(id) {
    return this.routeServices.get(id) ?? [];
  }

  // Return the notification types in the feed
  getNotificationTypes(options) {
    return this._applyQueryOptions(this.notificationTypes, options);
  }

  // Return the notification type with the specified identifier in the feed
  getNotificationType(id) {
    if (id === undefined)
      return undefined;
    return this.notificationTypes.get(id);
  }

  // Return the notifications in the feed
  getNotifications(options) {
    return this._applyQueryOptions(this.notifications, options);
  }

  // Return the notification with the specified identifier in the feed
  getNotification(id) {
    if (id === undefined)
      return undefined;
    return this.notifications.get(id);
  }

  // Apply the translation with the specified identifier to the specified record
  applyTranslation(object, key, language) {
    // Check if the language argument has been defined
    if (language === undefined)
      return object[key];

    // Check if the translation exists
    if (!this.translations.has(language)) {
      // Check if the language is the default language
      if (language === this.language)
        return object[key];
      else
        throw new Error(`Could not find translation for languge "${language}"`);
    }

    // Apply the translation
    return this.translations.get(language).apply(object, key);
  }


  // Apply the specified options to the specified map of records
  _applyQueryOptions(map, options) {
    let values = [...map.values()];

    // Check if a filter has been defined
    if (options?.filter !== undefined)
      values = values.filter(options.filter);

    return values;
  }
}
