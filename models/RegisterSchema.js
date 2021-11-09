import mongoose from "mongoose";

const RegisterSchema = mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true,
    max: 50,
  },
  firstName: {
    type: String,
    require: true,
    min: 3,
    max: 30,
  },
  lastName: {
    type: String,
    require: true,
    min: 3,
    max: 20,
  },
  password: {
    type: String,
    require: true,
    min: 3,
    max: 30,
  },
  admin: {
    type: Boolean,
  },
});

const registerSchema = mongoose.model("registerSchema",RegisterSchema);

export default registerSchema;
