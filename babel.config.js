// babel.config.js (in your Next.js folder)
module.exports = (api) => {
  api.cache(true)

  // adapt this to your setup
  const presets = ["next/babel"]
  const plugins = ["lodash"]

  return {
    presets,
    plugins
  }
}
