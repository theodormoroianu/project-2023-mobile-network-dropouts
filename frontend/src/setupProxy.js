const { createProxyMiddleware } = require("http-proxy-middleware");

// load .env file
require("dotenv").config({ path: `${process.cwd()}/../.env`, debug: true });

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://${process.env.BACKEND_HOST}:${process.env.BACKEND_PORT}/`,
      changeOrigin: true,
      secure: false,
    })
  );
};
