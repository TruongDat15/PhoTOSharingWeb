const mongoose = require("mongoose");
require("dotenv").config();

const models = require("../modelData/models.js");

const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Unable connecting to MongoDB!", error);
    return;
  }

  try {
    await User.deleteMany({});
    await Photo.deleteMany({});
    await SchemaInfo.deleteMany({});
  } catch (err) {
    console.error("Error clearing collections", err);
  }

  const userModels = models.userListModel();
  const mapFakeId2RealId = {};
  for (const user of userModels) {
    // use local const for created document
    const userObj = new User({
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
    try {
      await userObj.save();
      if (user._id) mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;
      console.log(
        "Adding user:",
        (user.first_name || "") + " " + (user.last_name || ""),
        " with ID ",
        user.objectID,
      );
    } catch (error) {
      console.error("Error create user", error);
    }
  }

  const photoModels = [];
  const userIDs = Object.keys(mapFakeId2RealId);
  userIDs.forEach(function (id) {
    photoModels.push(...models.photoOfUserModel(id));
  });

  for (const photo of photoModels) {
    // create photo with mapped user id (if exists)
    const photoObj = await Photo.create({
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: mapFakeId2RealId[photo.user_id] || null,
      comments: [],
    });
    photo.objectID = photoObj._id;

    if (photo.comments && Array.isArray(photo.comments)) {
      for (const comment of photo.comments) {
        // find mapped user id for comment author; fall back to comment.user.objectID
        const commentUserId = (comment.user && (mapFakeId2RealId[comment.user._id] || comment.user.objectID)) || null;
        photoObj.comments = photoObj.comments.concat([
          {
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: commentUserId,
          },
        ]);
        console.log(
          "Adding comment of length %d by user %s to photo %s",
          (comment.comment || "").length,
          commentUserId,
          photo.file_name,
        );
      }
    }

    try {
      await photoObj.save();
      console.log(
        "Adding photo:",
        photo.file_name,
        " of user ID ",
        photoObj.user_id,
      );
    } catch (error) {
      console.error("Error create photo", error);
    }
  }

  try {
    const schemaInfo = await SchemaInfo.create({
      version: versionString,
    });
    console.log("SchemaInfo object created with version ", schemaInfo.version);
  } catch (error) {
    console.error("Error create schemaInfo", error);
  }

  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error disconnecting from MongoDB", err);
  }
}

dbLoad();
