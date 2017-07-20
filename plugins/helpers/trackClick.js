'use strict';

const aug = require('aug');
const qs = require('querystring');

module.exports = function(url, opts, done) {
  const tmplVars = this.getVariables();

  if (!done) {
    done = opts;
    opts = {};
  }

  if (tmplVars.disableTracking === true) {
    return done(null, url);
  }

  // Generate Tags
  const tagList = [];
  if (options.clicks.tags) {
    tagList.push(options.clicks.tags);
  }

  if (opts.tags) {
    tagList.push(opts.tags);
  }

  const allOpts = aug({}, options.clicks, opts);
  delete allOpts.enabled;

  allOpts.tags = tagList.join(',');

  const paramStr = [];
  Object.keys(allOpts).forEach(p => {
    paramStr.push(`${p}=${qs.escape(allOpts[p])}`);
  });

  const toUrl = qs.escape(url);

  const link = `${options.trackingUrl}r?to=${toUrl}&${paramStr.join('&')}`;

  done(null, link);
};
