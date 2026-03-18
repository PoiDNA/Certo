const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return 'certo-id-build-' + Date.now();
  },
};

module.exports = withNextIntl(nextConfig);
