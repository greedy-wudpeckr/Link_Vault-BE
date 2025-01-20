import mongoose, { model, Schema } from "mongoose";
import 'dotenv/config'

import passportLocalMongoose from "passport-local-mongoose";

//@ts-ignore

try {
  //@ts-ignore
   mongoose.connect(process.env.MONGO_URL);
  console.log("DataBase Connected")
} catch (err) {
  console.log("error found" , err);
}



const UserSchema = new Schema({
  email : {
    type : String,
    required : true
}
});
UserSchema.plugin(passportLocalMongoose);

const ContentSchema = new mongoose.Schema({
  title: String,
  link: String,
  type: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});



export const UserModel = mongoose.model("User", UserSchema);
export const ContentModel = model("Content", ContentSchema);


