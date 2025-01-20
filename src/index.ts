import express from "express";
import { ContentModel, UserModel } from "./db";
import isLoggedIn from "./middleware";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { wrapAsync } from "./utils";
import LocalStrategy from "passport-local";


const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://link-vault-fe.vercel.app/", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
const sessionOptions = {
  secret: "ohh yhh",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
//@ts-ignore
app.use(session(sessionOptions));
app.use(express.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

app.set('trust proxy', 1) // trust first proxy


//@ts-ignore
passport.use(new LocalStrategy(UserModel.authenticate()));
//@ts-ignore

passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

//------------------------------------------------------------------

app.post("/api/v1/signup", wrapAsync(async (req: any, res: any) => {
  try {
      let { username, email, password } = req.body;
      const newUser = new UserModel({ email, username });
      const regtUser = await UserModel.register(newUser, password);

      // Log the user in after registration
      req.logIn(regtUser, (err: any) => {
          if (err) {
              return res.status(500).json({ msg: "Error logging in" });
          }
          // Only send the response here after login is successful
          return res.json({ msg: "Welcome! You are logged in!" });
      });

  } catch (e: any) {
      // Handle error
      return res.status(400).json({
          message: e.message
      });
  }
}));


  app.post("/api/v1/signin", (req, res, next) => {
    console.log("Request received at login:", req.body);
    passport.authenticate("local", (err : any, user : any, info : any) => {
      if (err) {
        return res.status(500).json({ msg: "Server error during login" });
      }
      if (!user) {
        return res.status(401).json({ msg: "Incorrect username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ msg: "Error logging in" });
        }
        return res.json({ msg: "Welcome! You are logged in!" });
      });
    })(req, res, next);
  });


app.post("/api/v1/content", isLoggedIn , async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  console.log("req received", req.body);
  await ContentModel.create({
    link,
    type,
    title: req.body.title,
    //@ts-ignore
    userId: req.user._id,
    tags: [],
  });

  res.json({
    message: "Content added",
  });
});

app.get("/api/v1/content" ,isLoggedIn, async (req, res) => {
  // @ts-ignore
  const userId = req.user._id;
  const content = await ContentModel.find({
    userId: userId,
  }).populate("userId", "username");
  res.json({
    content,
  });
});

// @ts-ignore

app.delete("/api/v1/content", isLoggedIn , async (req, res) => {
  const contentId = req.body.contentId;
  console.log("contentId", contentId);
  // @ts-ignore
  console.log("req.userId", req.body.userId);

  if (!contentId) {
    return res.status(400).json({ error: "Content ID is required" });
  }

  try {
    const result = await ContentModel.findByIdAndDelete({
      _id: contentId,

      //@ts-ignore
      userId: req.userId,
    });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting content" });
  }
});


app.get('/api/v1/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user); // Send user details
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});


app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    console.log("Logout Success");
    res.sendStatus(200); // Send a success status to the client
  });
});
  

app.listen(3000,()=>{
  console.log("Server is running on port 3000")
});






  
 

  