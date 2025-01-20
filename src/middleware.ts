function isLoggedIn(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    // Redirecting to login page or sending an unauthorized response
    return res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
}

export default isLoggedIn;
