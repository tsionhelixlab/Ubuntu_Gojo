const pool = require('../config/db');

function clean(v){ return typeof v==='string' ? v.trim() : v; }
function validateAcademic(score, scale){
  if(score===null || score===undefined || score==='') return null;
  const n=Number(score); if(!Number.isFinite(n)) return 'Academic score must be numeric';
  const limits={percentage:100,gpa_4:4,gpa_5:5,gpa_10:10};
  if(!limits[scale] || n<0 || n>limits[scale]) return 'Academic score does not fit the selected scale';
  return null;
}

exports.getProfile=async(req,res)=>{
  try{
    const r=await pool.query(`SELECT u.user_id,u.first_name,u.last_name,u.email,p.* 
      FROM users u LEFT JOIN student_profiles p ON p.user_id=u.user_id 
      WHERE u.user_id=$1`,[req.user.user_id]);
    if(!r.rowCount)return res.status(404).json({success:false,message:'User not found'});
    const row=r.rows[0];
    const tests=await pool.query('SELECT test_id,test_type,score,max_score,score_text FROM student_tests WHERE user_id=$1 ORDER BY test_id',
      [req.user.user_id]);
    res.json({success:true,profile:{...row,tests:tests.rows}});
  }catch(e){console.error(e);
    res.status(500).json({success:false,message:'Failed to get profile'});}
};

exports.saveProfile=async(req,res)=>{
 const b=req.body; const err=validateAcademic(b.academic_score,b.academic_scale); 
 if(err)
  return res.status(400).json({success:false,message:err});
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  await client.query(`UPDATE users SET first_name=$1,last_name=$2 WHERE user_id=$3`,
    [clean(b.first_name),clean(b.last_name),req.user.user_id]);
  const values=[req.user.user_id,clean(b.phone)||null,clean(b.school_name)||null,clean
    (b.education_level)||null,clean(b.field_of_study)||null,b.academic_score===''||b.academic_score==null?null:Number(b.academic_score),
    b.academic_scale||null,b.academic_percent_equivalent===''||b.academic_percent_equivalent==null?null:Number(b.academic_percent_equivalent),
    clean(b.conversion_source_url)||null,b.expected_graduation_year?Number(b.expected_graduation_year):null,clean(b.citizenship)||null,b.date_of_birth||null,clean(b.bio)||null];
  const q=`INSERT INTO student_profiles (user_id,phone,school_name,education_level,field_of_study,
  academic_score,academic_scale,academic_percent_equivalent,conversion_source_url,
  expected_graduation_year,citizenship,date_of_birth,bio) 
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) 
  ON CONFLICT(user_id) DO UPDATE SET phone=EXCLUDED.phone,school_name=EXCLUDED.school_name,
  education_level=EXCLUDED.education_level,field_of_study=EXCLUDED.field_of_study,academic_score=
  EXCLUDED.academic_score,academic_scale=EXCLUDED.academic_scale,academic_percent_equivalent=
  EXCLUDED.academic_percent_equivalent,conversion_source_url=
  EXCLUDED.conversion_source_url,expected_graduation_year=EXCLUDED.expected_graduation_year,
  citizenship=EXCLUDED.citizenship,date_of_birth=EXCLUDED.date_of_birth,bio=EXCLUDED.bio,updated_at=NOW() 
  RETURNING *`;
  const p=await client.query(q,values);
  await client.query('DELETE FROM student_tests WHERE user_id=$1',[req.user.user_id]);
  const tests=Array.isArray(b.tests)?b.tests:[];
  for(const t of tests){ if(t.test_type && t.score!=='') 
    await client.query('INSERT INTO student_tests(user_id,test_type,score,max_score,score_text) VALUES($1,$2,$3,$4,$5)',
  [req.user.user_id,clean(t.test_type),Number(t.score),t.max_score?Number(t.max_score):null,clean(t.score_text)||null]); }
  await client.query('COMMIT');
  const u=await pool.query('SELECT user_id,first_name,last_name,email,role FROM users WHERE user_id=$1',
    [req.user.user_id]);
  res.json({success:true,message:'Profile saved successfully',profile:{...u.rows[0],...p.rows[0],tests}});
 }catch(e)
 {await client.query('ROLLBACK');
  console.error(e);res.status(500).json({success:false,message:'Failed to save profile'});}
  finally{client.release();}
};
