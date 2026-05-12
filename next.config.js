/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
        crypto: false,
        buffer: false,
        stream: false,
      };

      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      });

      config.module.rules.push({
        test: /node_modules\/manifold-3d\/manifold\.js$/,
        loader: 'null-loader',
      });

      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
    }

    return config;
  },
  transpilePackages: ['three'],
};

module.exports = nextConfig;