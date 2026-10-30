require('dotenv').config();
const bcrypt=require('bcryptjs');
const pool=require('../src/config/db');
const [,,first='Ubuntu',last='Admin',email,password]=process.argv;
if(!email||!password)
    {console.log('Usage: node scripts/create-admin.js  First Last email password');
        process.exit(1)};
    (async()=>{try{const hash=await bcrypt.hash(password,12);
    await pool.query(`INSERT INTO users(first_name,last_name,email,password_hash,
            role) VALUES($1,$2,$3,$4,'admin') ON CONFLICT(email) 
            DO UPDATE SET role='admin',password_hash=EXCLUDED.password_hash,
            first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name`,
            [first,last,email.toLowerCase(),hash]);
            console.log('Admin account ready:',email)}
            catch(e){console.error(e)}finally{await pool.end()}})();
