import type {NextConfig} from 'next';
const config:NextConfig={
 output:'standalone',outputFileTracingIncludes:{'/*':['./drizzle/*.sql']},experimental:{cpus:2},
 poweredByHeader:false,
 images:{unoptimized:true},
 async headers(){return [{source:'/:path*',headers:[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'no-referrer'},
  {key:'Strict-Transport-Security',value:'max-age=31536000'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  // HTML routes receive a per-request nonce policy from proxy.ts.
  {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"},
 ]}];},
};
export default config;
