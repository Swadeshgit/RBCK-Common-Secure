import mongoose from "mongoose";

/* =====================================================
   ORGANIZATION — generic tenant entity.
   Kisi bhi project me iska matlab: School, Company,
   Hospital, Store-chain — jo bhi top-level owner-unit ho.
===================================================== */
const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, unique: true, sparse: true },
    domain: { type: String, trim: true },
    status: { type: String, default: "active" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    address: {
      addressLine1: { type: String },
      countryId: { type: Number },
      stateId: { type: Number },
      cityId: { type: Number },
      pincode: { type: String },
    },
    contact: {
      phone: { type: String },
      email: { type: String, lowercase: true },
      website: { type: String },
    },

    logo: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    meta: { type: Map, of: String }, // future/project-specific extra fields
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("Organization", organizationSchema);
