import {NextRequest,NextResponse} from 'next/server';
import {randomBytes} from 'node:crypto';
export function proxy(request:NextRequest){
 const nonce=randomBytes(24).toString('base64');
 const policy=`default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV==='development'?" 'unsafe-eval'":''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'self'`;
 const headers=new Headers(request.headers);headers.set('Content-Security-Policy',policy);headers.set('x-nonce',nonce);
 const response=NextResponse.next({request:{headers}});response.headers.set('Content-Security-Policy',policy);response.headers.set('Cache-Control','private, no-store');return response;
}
export const config={matcher:['/((?!api/|_next/|.*\\.[^/]+$).*)']};
