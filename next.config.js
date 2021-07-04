const LodashModuleReplacementPlugin = require("lodash-webpack-plugin")

module.exports = {
  webpack: (config, { webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config

    config.plugins.push(new LodashModuleReplacementPlugin({ collections: true, shorthands: true, caching: true }))
    config.optimization.minimize

    // Important: return the modified config
    return config
  },
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  }
}
