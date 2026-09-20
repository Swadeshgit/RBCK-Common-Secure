import express from "express";
import {
  createOrganization,
  getMyOrganizations,
  updateOrganization,
  switchOrganization,
} from "../controllers/organization.controller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("superAdmin"), createOrganization);
router.get("/", restrictTo("superAdmin"), getMyOrganizations);
router.put("/:id", restrictTo("superAdmin"), updateOrganization);
router.put("/switch/:id", restrictTo("superAdmin"), switchOrganization);

export default router;
