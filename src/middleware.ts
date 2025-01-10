import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

// export const userMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const header = req.headers["authorization"];
//   const decoded = jwt.verify(header as string, JWT_SECRET);
//   if (decoded) {
//     //@ts-ignore
//     req.userId = decoded.id;
//     next();
//   } else {
//     res.status(403).json({
//       message: "You are not logged in",
//     });
//   }
// };

// override the types of the express request object


function isLoggedIn(req : any, res : any, next : any) {
  console.log("Session Info:", req.session);
  console.log("User Info:", req.user);

  if (req.isAuthenticated()) {
    return next();
  }
  
}

export default isLoggedIn;
