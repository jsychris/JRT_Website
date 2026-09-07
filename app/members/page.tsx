import {currentAccount} from '@/lib/auth';
import {redirect} from 'next/navigation';
import Members from './members';
export const dynamic='force-dynamic';
export const metadata={title:'Members’ area',robots:{index:false,follow:false}};
export default async function MembersPage(){const account=await currentAccount();if(!account)redirect('/login');return <main id="main"><Members displayName={account.name}/></main>}
