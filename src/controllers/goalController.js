const pool=require('../config/db');
exports.getGoals=async(req,res)=>
    {try{const r=await pool.query('SELECT * FROM student_goals WHERE user_id=$1 ORDER BY goal_id DESC',
        [req.user.user_id]);res.json({success:true,goals:r.rows});}catch(e){console.error(e);
            res.status(500).json({success:false,message:'Failed to get goals'});}};
exports.saveGoal=async(req,res)=>
    {const {target_degree,target_field,target_countries,target_universities}=req.body;
if(!target_degree&&!target_field&&(!Array.isArray(target_countries)||!target_countries.length))
    return res.status(400).json({success:false,message:'Add at least one study goal'});
const client=await pool.connect();
try{await client.query('BEGIN');
    await client.query('DELETE FROM student_goals WHERE user_id=$1',[req.user.user_id]);
    const r=await client.query(`INSERT INTO student_goals(user_id,target_degree,target_field,target_countries,target_universities) VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [req.user.user_id,target_degree?.trim()||null,target_field?.trim()||null,Array.isArray(target_countries)?target_countries:[],Array.isArray(target_universities)?target_universities:[]]);
        await client.query('COMMIT');res.status(201).json({success:true,goal:r.rows[0]});}
        catch(e){await client.query('ROLLBACK');
            console.error(e);
            res.status(500).json({success:false,message:'Failed to save goal'});}
            finally{client.release();}};
