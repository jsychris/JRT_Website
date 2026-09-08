export function trustedOrigin(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||process.env.NODE_ENV==='production'&&!process.env.APP_URL)return false;
 const primary=process.env.APP_URL?new URL(process.env.APP_URL).origin:new URL(request.url).origin;
 const additional=(process.env.ADDITIONAL_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
 return origin===primary||additional.includes(origin);
}
