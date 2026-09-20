import mongoose from "mongoose";

/* =====================================================
   SCOPE — generic sub-unit under an Organization.
   Kisi bhi project me: Branch, Warehouse, Department,
   Store, Region — jo bhi "sub-division" ho.
   Optional hai — jo project single-unit hai wo isko
   skip bhi kar sakta hai (sirf orgId hi kaafi hoga).
===================================================== */
const scopeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, sparse: true },

    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    parentScopeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scope",
      default: null,
      index: true,
    },
    isMain: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: { type: mongoose.Schema.Types.Mixed, default: {} },
    contact: { type: mongoose.Schema.Types.Mixed, default: {} },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

scopeSchema.index({ orgId: 1, parentScopeId: 1, isMain: 1 });

export default mongoose.model("Scope", scopeSchema);
