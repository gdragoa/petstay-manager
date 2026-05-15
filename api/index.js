const { createApp } = require('../backend/src/index');

let appPromise;

module.exports = (req, res) => {
  if (!appPromise) appPromise = createApp();
  appPromise
    .then(app => app(req, res))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
};
