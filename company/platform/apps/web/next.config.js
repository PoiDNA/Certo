/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return 'certo-id-build-' + Date.now();
  },
};
module.exports = nextConfig;
