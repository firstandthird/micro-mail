const aug = require('aug');
const qs = require('querystring');

module.exports = function (url, opts, done = (unused, val) => val) {
  const tmplVars = this.getVariables();

  const getOpts = this.env.filters.opts;

  if (!opts) {
    opts = {};
  }

  if (tmplVars.disableTracking === true || !getOpts('trackingUrl')) {
    return done(null, url);
  }

  // Generate Tags
  const tagList = [];
  if (getOpts('clicks').tags) {
    tagList.push(getOpts('clicks').tags);
  }

  if (opts.tags) {
    tagList.push(opts.tags);
  }

  const allOpts = aug({}, getOpts('clicks'), opts);
  delete allOpts.enabled;

  allOpts.tags = tagList.join(',');

  const paramStr = [];
  Object.keys(allOpts).forEach(p => paramStr.push(`${p}=${qs.escape(allOpts[p])}`));
  const toUrl = qs.escape(url);

  const link = `${getOpts('trackingUrl')}r?to=${toUrl}&${paramStr.join('&')}`;

  return done(null, link);
};
