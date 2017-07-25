module.exports = (name = 'john', done) => {
  const out = `Hello there ${name}`;

  done(null, out);
};
