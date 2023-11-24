module.exports = {
  apps: [
    {
      name: "new-invoice-lg-node",
      script: "./index.js", // your script
      watch: true,
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4051,
        DATABASE: "mongodb://10.200.90.152:27017/new-invoice-lg",
      },
    },
  ],
};
