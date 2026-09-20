import mongoose from "mongoose";

/* =====================================================
   USER PERMISSION — actual assigned access per subAdmin.
   Role se defaultPermissions copy hoti hain (roleId link
   rakhte hain traceability ke liye), fir yahan customize
   ho sakti hain — isliye Role aur UserPermission alag hain.
===================================================== */
const userPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },

    access: [
      {
        scopeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scope" }],
        permissions: [
          {
            module: { type: String, required: true },
            actions: { type: mongoose.Schema.Types.Mixed, default: {} },
            _id: false,
          },
        ],
        _id: false,
      },
    ],

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

export default mongoose.model("UserPermission", userPermissionSchema);
