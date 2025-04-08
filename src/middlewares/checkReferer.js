const checkReferer = (req, res, next) => {
    const referer = req.get('Referer');
  
    if (!referer || !referer.includes(req.headers.host)) {
      return res.status(403).send('Forbidden');
    }
  
    next();
  };
  
  module.exports = checkReferer;
  