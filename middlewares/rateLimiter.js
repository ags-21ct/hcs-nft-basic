const rateLimit =  require('express-rate-limit');

module.exports = rateLimiterUsingThirdParty = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 50000,
  message: 'You have exceeded the 4000 requests in 24 hrs limit!', 
  headers: true,
});