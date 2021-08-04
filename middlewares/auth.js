const dotenv = require('dotenv');
dotenv.config();
module.exports = (req, res, next) => {
  try {
    const apikey = req.body.apikey;;
    const secret = req.body.secret;
    if (apikey != process.env.APIKEY && secret != process.env.SECRETKEY) {
      throw 'Invalid APIKEY';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};