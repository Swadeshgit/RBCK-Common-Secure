import mongoose from "mongoose";

/* =====================================================
   ROLE — dynamic, project ke andar Admin khud banayega
   (e.g. "Teacher", "Manager", "Support Agent" — kuch bhi naam).
   defaultPermissions staff-create ke waqt auto-fill hoti hain,
   fir customize ho sakti hain (UserPermission me override).
===================================================== */
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Teacher"
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    defaultPermissions: [
      {
        module: { type: String, required: true }, // Module.name se match hona chahiye
        actions: { type: mongoose.Schema.Types.Mixed, default: {} }, // { view: true, create: false, ... }
        _id: false,
      },
    ],

    isSystemRole: { type: Boolean, default: false }, // future: kuch roles delete-protected rakhne ke liye
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

/* Ek org ke andar role-naam unique ho (do "Teacher" na banein) */
roleSchema.index({ orgId: 1, name: 1 }, { unique: true });

export default mongoose.model("Role", roleSchema);
