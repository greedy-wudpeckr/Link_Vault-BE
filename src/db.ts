import mongoose, { model, Schema } from "mongoose";

import passportLocalMongoose from "passport-local-mongoose";

//@ts-ignore
mongoose.connect("mongodb+srv://mudit:gglmaooo@cluster0.umyoj.mongodb.net/your_database?retryWrites=true&w=majority&tls=true&appName=Cluster0");


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


