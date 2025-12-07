import MiniSearch from 'minisearch';


// Class that defines a feed
export default class Feed
{
  // Constructor
  constructor(data) {
    this._agencies = data?.agencies ?? {};
    this._modalities = data?.modalities ?? {};
    this._nodes = data?.nodes ?? {};
    this._routes = data?.routes ?? {};
    this._transfers = data?.transfers ?? {};
    this._services = data?.services ?? {};
    this._nodeServices = data?.nodeServices ?? {};
    this._routeServices = data?.routeServices ?? {};
    this._notificationTypes = data?.notificationTypes ?? {};
    this._notifications = data?.notifications ?? {};

    this._createNodesSearchIndex();
  }


  // Return the agencies in the feed
  get agencies() {
    return Object.values(this._agencies);
  }

  // Return the agency with the specified id in the feed
  getAgency(id) {
    if (id === undefined)
      return undefined;
    return this._agencies[id];
  }


  // Return the modalities in the feed
  get modalities() {
    return Object.values(this._modalities);
  }

  // Return the modality with the specified id in the feed
  getModality(id) {
    if (id === undefined)
      return undefined;
    return this._modalities[id];
  }


  // Return the nodes in the feed
  get nodes() {
    return Object.values(this._nodes);
  }

  // Return the node with the specified id in the feed
  getNode(id) {
    if (id === undefined)
      return undefined;
    return this._nodes[id];
  }
  
  // Return the nodes that match the search query in the feed
  searchNodes(query) {
    return this._nodesSearchIndex.search(query).map(result => this.getNode(result.id));
  }

  
  // Return the routes in the feed
  get routes() {
    return Object.values(this._routes);
  }

  // Return the route with the specified id in the feed
  getRoute(id) {
    if (id === undefined)
      return undefined;
    return this._routes[id];
  }


  // Return the transfers in the feed
  get transfers() {
    return Object.values(this._transfers);
  }

  // Return the transfer with the specified id in the feed
  getTransfer(id) {
    if (id === undefined)
      return undefined;

    return this._transfers[id];
  }
  

  // Return the services in the feed
  get services() {
    return Object.values(this._services);
  }

  // Return the service with the specified id in the feed
  getService(id) {
    if (id === undefined)
      return undefined;
    return this._services[id];
  }

  
  // Return the node services in the feed
  get nodeServices() {
    return Object.values(this._nodeServices);
  }

  // Return the services for the specified id in the feed
  getNodeServices(id) {
    return this._nodeServices[id] ?? [];
  }

  
  // Return the route services in the feed
  get routeServices() {
    return Object.values(this._routeServices);
  }

  // Return the services for the specified id in the feed
  getRouteServices(id) {
    return this._routeServices[id] ?? [];
  }

  
  // Return the notification types in the feed
  get notificationTypes() {
    return Object.values(this._notificationTypes);
  }


  // Return the notification type with the specified id in the feed
  getNotificationType(id) {
    if (id === undefined)
      return undefined;
    return this._notificationTypes[id];
  }

  
  // Return the notifications in the feed
  get notifications() {
    return Object.values(this._notifications);
  }

  // Return the notification with the specified id in the feed
  getNotification(id) {
    if (id === undefined)
      return undefined;
    return this._notifications[id];
  }
  

  // Create the nodes search index of the feed
  _createNodesSearchIndex() {
    this._nodesSearchIndex = new MiniSearch({
      fields: ['name', 'city', 'code'],
      storeFields: ['modality'],
      searchOptions: {prefix: true, fuzzy: 0.1, combineWith: 'AND', boost: {name: 2}, boostDocument: this._boostNodeDocument.bind(this)}
    });
    this._nodesSearchIndex.addAll(this.nodes);
  }

  // Function to boost a node document in a search index
  _boostNodeDocument(id, term, storedFields) {
    let modalityIndex = this.modalities.findIndex(m => m.id === storedFields.modality?.id);
    if (storedFields.modality !== undefined && modalityIndex > -1)
      return 0.7 + (this.modalities.length - modalityIndex) / this.modalities.length * 0.3;
    else
      return 0.7;
  }
}
