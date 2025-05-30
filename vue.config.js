const { defineConfig } = require('@vue/cli-service')
const Dotenv = require('dotenv-webpack')
module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new Dotenv(
        {
        path: './.env', // load this now instead of the ones in '.env'
        safe: true, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
        allowEmptyValues: false, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
        systemvars: false, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
        silent: false, // hide any errors
        defaults: false, // load '.env.defaults' as the default values if empty.
        prefix: 'VUE_APP_', // Only include environment variables that start with VUE_APP_
        }
      )
    ]
  },
  transpileDependencies: true
})
