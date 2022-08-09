const rateLimit = require('express-rate-limit');

exports.loginRate = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 3, // Limit each IP to 3 requests per `window` (here, per 5 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
  
exports.signupRate = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Limit each IP to 100 requests per `window` (here, per 1 hour)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
