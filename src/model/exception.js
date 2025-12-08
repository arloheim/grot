export default class FeedError extends Error
{
  // Constructor
  constructor(message, options) {
    super(message, options);
    this.name = 'FeedError';
  }
}