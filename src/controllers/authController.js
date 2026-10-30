const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validatePassword } = require('../utils/password');
const { isValidEmail } = require('../utils/email');

function tokenFor(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ user_id:user.user_id, role:user.role }, process.env.JWT_SECRET, { expiresIn:'8h' });
}

exports.register = async (req,res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !password) 
    return res.status(400).json({success:false,message:'First name, last name, email and password are required'});
  if (!isValidEmail(email.trim())) return res.status(400).json({success:false,message:'Please provide a valid email address'});
  const check = validatePassword(password); if (!check.valid) 
    return res.status(400).json({success:false,message:check.message});
  const client = await pool.connect();
  try {
    const normalized = email.trim().toLowerCase();
    await client.query('BEGIN');
    const exists = await client.query('SELECT user_id FROM users WHERE email=$1',[normalized]);
    if (exists.rowCount) { await client.query('ROLLBACK'); return res.status(409).json({success:false,message:'An account with this email already exists'}); }
    const hash = await bcrypt.hash(password,12);
    const result = await client.query(`INSERT INTO users (first_name,last_name,email,password_hash,role) VALUES ($1,$2,$3,$4,'student') RETURNING user_id,first_name,last_name,email,role,created_at`,
      [first_name.trim(),last_name.trim(),normalized,hash]);
    await client.query('COMMIT');
    const user=result.rows[0];
    return res.status(201).json({success:true,message:'Registration successful',user,token:tokenFor(user)});
  } catch(e) 
  { await client.query('ROLLBACK'); console.error(e); 
    return res.status(500).json({success:false,message:'Registration failed'}); } 
    finally { client.release(); }
};

exports.login = async (req,res) => {
  const { email,password }=req.body;
  if(!email||!password) return res.status(400).json({success:false,message:'Email and password are required'});
  try {
    const r=await pool.query('SELECT user_id,first_name,last_name,email,password_hash,role,created_at FROM users WHERE email=$1',[email.trim().toLowerCase()]);
    if(!r.rowCount || !(await bcrypt.compare(password,r.rows[0].password_hash))) return res.status(401).json({success:false,message:'Invalid email or password'});
    const {password_hash,...user}=r.rows[0];
    return res.json({success:true,message:'Login successful',user,token:tokenFor(user)});
  } catch(e){console.error(e);res.status(500).json({success:false,message:'Login failed'});}
};

exports.me = async (req,res) => {
  try { const r=await pool.query('SELECT user_id,first_name,last_name,email,role,created_at FROM users WHERE user_id=$1',[req.user.user_id]); if(!r.rowCount)return res.status(404).json({success:false,message:'User not found'}); res.json({success:true,user:r.rows[0]}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to retrieve user'});}
};
exports.logout = async (req,res)=>res.json({success:true,message:'Signed out. Remove the local token.'});
