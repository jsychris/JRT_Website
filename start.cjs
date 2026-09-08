// Railway starts this wrapper. Only volume ownership setup runs as root.
const fs=require('node:fs');
const path=require('node:path');
process.umask(0o077);
if(process.getuid?.()===0){
 const directory=process.env.RAILWAY_VOLUME_MOUNT_PATH||process.env.DATA_DIRECTORY;
 if(!directory||path.resolve(directory)==='/')throw new Error('A dedicated data directory is required');
 fs.mkdirSync(directory,{recursive:true,mode:0o700});
 function own(p){const stat=fs.lstatSync(p);if(stat.isSymbolicLink())throw new Error('Symlink in data directory');if(stat.isDirectory()){for(const name of fs.readdirSync(p))own(path.join(p,name));}fs.chownSync(p,1000,1000);fs.chmodSync(p,stat.isDirectory()?0o700:0o600);}
 own(directory);
 process.setgroups([]);process.setgid(1000);process.setuid(1000);
}
console.info('Application runtime uid='+process.getuid?.());
require('./server.js');
