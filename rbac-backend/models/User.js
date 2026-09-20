import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false },
    phone: { type: String, default: null },
    avatar: { type: String, default: null },

    userType: {
      type: String,
      enum: ["superAdmin", "subAdmin"],
      default: "subAdmin",
    },

    googleId: { type: String, default: null, unique: true, sparse: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },

    /* ========== OTP-BASED PASSWORD RESET (alag flow, link-wale ke saath) ========== */
    otpCode: { type: String, default: null, select: false },
    otpExpires: { type: Date, default: null, select: false },

    mainOrgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    currentOrgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    currentScopeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scope", default: null },

    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },

    tokenVersion: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("User", userSchema);