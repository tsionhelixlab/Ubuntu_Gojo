const pool=require('../config/db');
exports.list=async(req,res)=>
    {try{const r=await pool.query('SELECT * FROM opportunities ORDER BY created_at DESC');
        res.json({success:true,data:r.rows});}
        catch(e){console.error(e);
            res.status(500).json({success:false,message:'Failed to load opportunities'});}};
exports.create=async(req,res)=>
    {const {title,provider,description,category,deadline,application_url,min_age,
        max_age,min_academic_percent}=req.body;if(!title)
        return res.status(400).json({success:false,message:'Title is required'});
        try{const r=await pool.query(`INSERT INTO opportunities(title,provider,
            description,category,deadline,application_url,min_age,max_age,
            min_academic_percent,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
RETURNING *`,[title,provider||null,description||null,category||'Scholarship',deadline||null,application_url||null,min_age||null,max_age||null,min_academic_percent||null,req.user.user_id]);
res.status(201).json({success:true,data:r.rows[0]});}
catch(e){console.error(e);
    res.status(500).json({success:false,message:'Failed to create opportunity'});}};
exports.update=async(req,res)=>
    {const {id}=req.params;
const b=req.body;
try{const r=await pool.query(`UPDATE opportunities SET title=COALESCE($1,title),provider=COALESCE($2,provider),description=COALESCE($3,description),category=COALESCE($4,category),deadline=COALESCE($5,deadline),application_url=COALESCE($6,application_url),min_age=COALESCE($7,min_age),
    max_age=COALESCE($8,max_age),min_academic_percent=COALESCE($9,min_academic_percent),
    updated_at=NOW() WHERE opportunity_id=$10 RETURNING *`,
    [b.title,b.provider,b.description,b.category,b.deadline,b.application_url,b.min_age,b.max_age,b.min_academic_percent,id]);
    if(!r.rowCount)
        return res.status(404).json({success:false,message:'Opportunity not found'});
    res.json({success:true,data:r.rows[0]});}
    catch(e){console.error(e);
        res.status(500).json({success:false,message:'Failed to update opportunity'});}};
exports.remove=async(req,res)=>
    {try{const r=await pool.query('DELETE FROM opportunities WHERE opportunity_id=$1 RETURNING opportunity_id',
        [req.params.id]);if(!r.rowCount)
            return res.status(404).json({success:false,message:'Opportunity not found'});
        res.json({success:true});}
        catch(e){console.error(e);res.status(500).json({success:false,message:'Failed to delete opportunity'});}};
