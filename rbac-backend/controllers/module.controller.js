import { Module } from "../models/index.js";

/* =====================================================
   REGISTER MODULE
   POST /api/modules   (protected, superAdmin only)
   Project apne features yahan register karta hai —
   e.g. { name: "Student", label: "Student Management" }
   ya { name: "Product", actions: ["view","create","edit","delete","export"] }
===================================================== */
export const createModule = async (req, res, next) => {
  try {
    const { name, label, actions } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Module name is required" });
    }

    const existing = await Module.findOne({ name });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Module already exists" });
    }

    const module = await Module.create({
      name,
      label: label || name,
      actions:
        Array.isArray(actions) && actions.length
          ? actions
          : ["view", "create", "edit", "delete"],
    });

    return res
      .status(201)
      .json({ success: true, message: "Module registered", module });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET ALL MODULES
   GET /api/modules   (protected)
   Frontend isi list se Role-create aur Permission-assign
   ke checkbox-matrix banayega — hardcoded nahi.
===================================================== */
export const getModules = async (req, res, next) => {
  try {
    const modules = await Module.find({ isActive: true }).sort({ name: 1 });

    return res
      .status(200)
      .json({ success: true, count: modules.length, modules });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   UPDATE MODULE
   PUT /api/modules/:id   (protected, superAdmin only)
===================================================== */
export const updateModule = async (req, res, next) => {
  try {
    const { label, actions, isActive } = req.body;
    const updates = {};
    if (label !== undefined) updates.label = label;
    if (actions !== undefined) updates.actions = actions;
    if (isActive !== undefined) updates.isActive = isActive;

    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Module updated", module });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   DELETE MODULE
   DELETE /api/modules/:id   (protected, superAdmin only)
   Hard delete nahi — isActive false (soft), kyunki
   existing Role/UserPermission me reference hoga
===================================================== */
export const deleteModule = async (req, res, next) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true },
    );

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Module deactivated" });
  } catch (error) {
    next(error);
  }
};
