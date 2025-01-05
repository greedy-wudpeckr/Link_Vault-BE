import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_SECRET } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors";



const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
  // TODO: zod validation , hash the password
  const username = req.body.username;
  const password = req.body.password;

  try {
    await UserModel.create({
      username: username,
      password: password,
    });

    res.json({
      message: "User signed up",
    });
  } catch (e) {
    res.status(411).json({
      message: "User already exists",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username,
    password,
  });
  if (existingUser) {
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Incorrrect credentials",
    });
  }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  console.log("req received", req.body);
  await ContentModel.create({
    link,
    type,
    title: req.body.title,
    //@ts-ignore
    userId: req.userId,
    tags: [],
  });

  res.json({
    message: "Content added",
  });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId: userId,
  }).populate("userId", "username");
  res.json({
    content,
  });
});

// @ts-ignore

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  console.log("contentId", contentId);
  // @ts-ignore
  console.log("req.userId", req.userId);

  if (!contentId) {
    return res.status(400).json({ error: "Content ID is required" });
  }

  try {
    const result = await ContentModel.deleteOne({
      link: contentId,
      // Ensure this is scoped to the authenticated user
      // @ts-ignore
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Content not found or not authorized" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting content" });
  }
});

// @ts-ignore

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share;

  try {
    // Check if share is enabled
    if (share) {
      // Check if the user already has a link
      const existingLink = await LinkModel.findOne({
        //@ts-ignore
        userId: req.userId, // User ID from middleware
      });

      if (existingLink) {
        // Link already exists
        return res.status(200).json({
          message: `/share/${existingLink.Hash}`,
        });
      } else {
        // Generate a new unique hash
        const hash = random(10);
        const isUnique = await LinkModel.countDocuments({ Hash: hash }) === 0;

        if (!isUnique) {
          return res.status(500).json({ error: "Hash collision. Try again." });
        }

        // Save the new link
        await LinkModel.create({
          Hash: hash,
          //@ts-ignore
          userId: req.userId,
        });

        return res.status(200).json({
          message: `/share/${hash}`,
        });
      }
    } else {
      // If share is disabled, remove the link
      await LinkModel.deleteOne({
        //@ts-ignore
        userId: req.userId,
      });

      return res.status(200).json({
        message: "Link removed",
      });
    }
  } catch (error) {
    console.error("Error in brain share logic:", error);

    return res.status(500).json({
      error: "An error occurred while processing your request. Please try again.",
    });
  }
});

app.get("/api/v1/brain/share/:shareLink", async (req, res) => {
  const shareLink = req.params.shareLink;

  const link = await LinkModel.findOne({
    Hash: shareLink,
  });

  if (link) {
    const content = await ContentModel.find({
      userId: link.userId,
    });

    const user = await UserModel.findById(link.userId);

    res.json({
      username: user?.username,
      content,
    });
  } else {
    res.status(411).json({
      message: "Link is incorrect or expired",
    });
  }
});

app.listen(3000,()=>{
  console.log("Server is running on port 3000")
},)
