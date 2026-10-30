function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) return { valid:false, message:'Password must be at least 8 characters long' };
  return { valid:true };
}
module.exports = { validatePassword };
