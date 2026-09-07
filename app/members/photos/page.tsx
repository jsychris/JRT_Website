import {currentAccount} from '@/lib/auth';
import {redirect} from 'next/navigation';
import Photos from './photos';
export default async function Page(){const m=await currentAccount();if(!m)redirect('/login');if(!['admin','member'].includes(m.role))redirect('/members');return <main id="main" className="section wrap"><a className="textlink" href="/members">← Members’ area</a><h1 style={{fontSize:44,margin:'24px 0'}}>Club photos</h1><Photos admin={m.role==='admin'}/></main>}
