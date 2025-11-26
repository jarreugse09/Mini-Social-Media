const checkReferer = (req, res, next) => {
  // Allow requests when there is no referer (e.g. direct asset requests) or when referer/origin matches host
  const referer = req.get("Referer") || req.get("Origin");
  const host = req.headers.host;

  if (referer && host && !referer.includes(host)) {
    return res.status(403).send("Forbidden");
  }

  next();
};

module.exports = checkReferer;
