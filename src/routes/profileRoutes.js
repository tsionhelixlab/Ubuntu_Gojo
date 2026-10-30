const express=require('express');
const r=express.Router();
const c=require('../controllers/profileController');
const auth=require('../middleware/authMiddleware');
r.get('/',auth,c.getProfile);
r.post('/',auth,c.saveProfile);
r.put('/',auth,c.saveProfile);
module.exports=r;
