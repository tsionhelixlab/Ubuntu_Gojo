const express=require('express'); 
const r=express.Router(); 
const c=require('../controllers/authController'); 
const auth=require('../middleware/authMiddleware');
r.post('/register',c.register);
r.post('/login',c.login);
r.get('/me',auth,c.me);
r.post('/logout',auth,c.logout);
module.exports=r;
