
function isLoggedIn(req : any, res : any, next : any) {
  // console.log("Session Info:", req.session);
  // console.log("User Info:", req.user);
  // console.log("isAuthenticated:", req.isAuthenticated());

  if (req.isAuthenticated()) {
    return next();
  }
  
}

export default isLoggedIn;
