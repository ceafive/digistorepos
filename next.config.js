// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const { withSentryConfig } = require("@sentry/nextjs");
const nextTranslate = require("next-translate");
const withPlugins = require("next-compose-plugins");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  ...nextTranslate(),
  webpack: (config, { webpack }) => {
    config.plugins.push(new LodashModuleReplacementPlugin({ collections: true, shorthands: true, caching: true, paths: true }));
    config.optimization.minimize;

    // Important: return the modified config
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const SentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withPlugins([[withBundleAnalyzer, withSentryConfig(SentryWebpackPluginOptions)], nextConfig]);
