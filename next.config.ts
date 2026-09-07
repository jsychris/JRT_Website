import type {NextConfig} from 'next';
const config:NextConfig={output:'standalone',outputFileTracingIncludes:{'/*':['./drizzle/*.sql']},experimental:{cpus:2}};
export default config;
