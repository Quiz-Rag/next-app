/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname; // points @ to project root
    return config;
  },
};
module.exports = nextConfig;
