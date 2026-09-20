import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, Organization, Module, Role } from "./models/index.js";

dotenv.config();

/* =====================================================
   SEED SCRIPT
   Run: node seed.js
   Ye ek clean baseline bana deta hai testing shuru karne ke liye:
   - Default modules (project ke hisaab se badal sakte ho)
   - Ek superAdmin user
   - Ek Organization (superAdmin ke naam)
   - Ek sample Role ("Manager") kuch default permissions ke saath
===================================================== */

const DEFAULT_MODULES = [
  { name: "Student", label: "Student Management" },
  { name: "Staff", label: "Staff Management" },
  { name: "Product", label: "Product Management" },
  { name: "Order", label: "Order Management" },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    /* ---------- 1. MODULES ---------- */
    for (const mod of DEFAULT_MODULES) {
      const exists = await Module.findOne({ name: mod.name });
      if (!exists) {
        await Module.create(mod);
        console.log(`Module created: ${mod.name}`);
      } else {
        console.log(`Module already exists: ${mod.name}`);
      }
    }

    /* ---------- 2. SUPERADMIN USER ---------- */
    const email = "superadmin@test.com";
    const plainPassword = "Admin@123";

    let superAdmin = await User.findOne({ email });
    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      superAdmin = await User.create({
        name: "Super Admin",
        email,
        password: hashedPassword,
        userType: "superAdmin",
      });
      console.log(`SuperAdmin created: ${email} / ${plainPassword}`);
    } else {
      console.log("SuperAdmin already exists:", email);
    }

    /* ---------- 3. ORGANIZATION ---------- */
    let org = await Organization.findOne({ createdBy: superAdmin._id });
    if (!org) {
      org = await Organization.create({
        name: "Demo Organization",
        code: "DEMO-ORG",
        createdBy: superAdmin._id,
        ownerId: superAdmin._id,
      });

      superAdmin.mainOrgId = org._id;
      superAdmin.currentOrgId = org._id;
      await superAdmin.save();

      console.log(`Organization created: ${org.name}`);
    } else {
      console.log("Organization already exists:", org.name);
    }

    /* ---------- 4. SAMPLE ROLE ---------- */
    const roleExists = await Role.findOne({ name: "Manager", orgId: org._id });
    if (!roleExists) {
      await Role.create({
        name: "Manager",
        orgId: org._id,
        defaultPermissions: [
          {
            module: "Product",
            actions: { view: true, create: true, edit: true, delete: false },
          },
          {
            module: "Order",
            actions: { view: true, create: false, edit: true, delete: false },
          },
        ],
        createdBy: superAdmin._id,
      });
      console.log("Sample Role created: Manager");
    } else {
      console.log("Role already exists: Manager");
    }

    console.log("\n✅ Seeding complete!");
    console.log("Login with -> email:", email, "| password:", plainPassword);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

run();
