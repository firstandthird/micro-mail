module.exports = function(mailObj, sendIndividual) {
  const server = this;
  if (!sendIndividual) {
    return server.transport.sendMail(mailObj);
  }
  // send one email per destination rather than all at once:
  // make sure it's an array:
  let destinations = [];
  if (Array.isArray(mailObj.to)) {
    destinations = mailObj.to;
  } else {
    destinations = mailObj.to.split(',');
  }
  return Promise.all(destinations.map(d => new Promise(async(resolve, reject) => {
    const sendObj = Object.assign({}, mailObj, { to: d.trim() });
    try {
      const result = await server.transport.sendMail(sendObj);
      return resolve(result);
    } catch (e) {
      return resolve({
        response: 'failed to send',
        accepted: [],
        rejected: [sendObj]
      });
    }
  })));
};
