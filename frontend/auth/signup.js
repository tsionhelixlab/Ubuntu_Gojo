const form=document.getElementById('signupForm');
const password=document.getElementById('password');
const toggle=document.getElementById('togglePassword');
if(toggle)toggle.addEventListener('click',()=>{password.type=password.type==='password'?'text':'password';toggle.textContent=password.type==='password'?'◉':'◎';});
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.checkValidity())return form.reportValidity();
 const first_name=document.getElementById('firstName').value.trim(),last_name=document.getElementById('lastName').value.trim(),email=document.getElementById('email').value.trim(),pw=password.value;
 try{const r=await fetch(`${API_BASE_URL}/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({first_name,last_name,email,password:pw})});const d=await r.json();if(!r.ok)return alert(d.message||'Registration failed.');localStorage.setItem('signupEmail',email);alert('Welcome to Ubuntu Gojo! Your account has been created. Please sign in.');location.href='signin.html';}catch(err){console.error(err);alert('Unable to connect to Ubuntu Gojo. Make sure the server is running.');}});
