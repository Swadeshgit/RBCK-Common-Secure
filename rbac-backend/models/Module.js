import mongoose from "mongoose";

/* =====================================================
   MODULE — DB-driven feature registry (hardcoded nahi).
   Har project apne modules yahan register karega
   (e.g. "Student", "Product", "Ticket", "Invoice").
   Role/UserPermission isi list ke against validate honge.
===================================================== */
const moduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g. "Student"
    label: { type: String, trim: true }, // e.g. "Student Management" (UI display ke liye)
    actions: {
      type: [String],
      default: ["view", "create", "edit", "delete"], // project chahe to extra action bhi add kar sakta hai e.g. "export"
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("Module", moduleSchema);
