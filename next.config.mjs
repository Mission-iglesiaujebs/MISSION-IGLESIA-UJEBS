/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite subir logos y fotos de perfil (hasta 3 MB) desde los formularios
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};
export default nextConfig;
