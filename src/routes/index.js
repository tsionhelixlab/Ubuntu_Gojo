const express=require('express');
const router=express.Router();
const auth=require('./authRoutes'); 
const profile=require('./profileRoutes'); 
const goals=require('./goalRoutes'); 
const matching=require('./matchingRoutes'); 
const admin=require('./adminRoutes');
router.get('/',(req,res)=>
    res.json({success:true,message:'Ubuntu Gojo API is running'}));
router.use('/auth',auth); 
router.use('/profile',profile); 
router.use('/goals',goals); 
router.use('/matching',matching); 
router.use('/admin',admin);
module.exports=router;
