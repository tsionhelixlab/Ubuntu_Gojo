const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) 
    return res.status(401).json({ success:false, message:'Authentication token is required' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch 
  { return res.status(401).json({ success:false, message:'Invalid or expired authentication token' }); }
};
