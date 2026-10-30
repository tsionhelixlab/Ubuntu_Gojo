const express=require('express');
const r=express.Router();
const c=require('../controllers/goalController');
const auth=require('../middleware/authMiddleware');
r.get('/',auth,c.getGoals);
r.post('/',auth,c.saveGoal);
module.exports=r;
