import {cookies} from 'next/headers';
import {sessionAccount} from './account-core.mjs';
export const COOKIE='jrt_session';
export async function currentAccount(){return sessionAccount((await cookies()).get(COOKIE)?.value) as {id:string,email:string,name:string,role:string}|null;}
