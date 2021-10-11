module.exports = {
  onDemandEntries: {
    // Make sure entries are not getting disposed.
    maxInactiveAge: 1000 * 60 * 60,
  },
  experimental: {
    swcLoader: false,
  },
  amp: {
    canonicalBase: 'http://localhost:1234',
  },
  // edit here
}
