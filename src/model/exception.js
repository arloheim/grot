// Class that defines a feed error
export class FeedError extends Error
{
  // Constructor
  constructor(message, options) {
    super(message, options);
    this.name = 'FeedError';
  }
}