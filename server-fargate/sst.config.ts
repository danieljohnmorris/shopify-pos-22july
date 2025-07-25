/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "shopify-pos-server",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const api = new sst.aws.ApiGatewayV2("Api", {
      cors: {
        allowCredentials: true,
        allowHeaders: ["content-type", "authorization"],
        allowMethods: ["*"],
        allowOrigins: ["*"],
      },
    });

    api.route("GET /", "index.handler");
    api.route("GET /health", "index.handler");
    api.route("GET /api/users", "index.handler");
    api.route("POST /api/data", "index.handler");

    return {
      api: api.url,
    };
  },
});
