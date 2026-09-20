import express from "express";
import {
  createModule,
  getModules,
  updateModule,
  deleteModule,
} from "../controllers/module.controller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("superAdmin"), createModule);
router.get("/", getModules); // subAdmin ko bhi list dikhni chahiye (apni permission dekhne ke context me)
router.put("/:id", restrictTo("superAdmin"), updateModule);
router.delete("/:id", restrictTo("superAdmin"), deleteModule);

export default router;
