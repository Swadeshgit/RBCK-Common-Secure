import express from "express";
import {
  createStaff,
  getStaffList,
  toggleStaffActive,
} from "../controllers/staff.controller.js";
import {
  assignPermission,
  getPermissionByUser,
  getMyPermissions,
} from "../controllers/userPermission.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/checkPermission.js";

const router = express.Router();

router.use(protect);

/* ===== STAFF ===== */
router.post("/", checkPermission("Staff", "create"), createStaff);
router.get("/", checkPermission("Staff", "view"), getStaffList);
router.put(
  "/:id/toggle-active",
  checkPermission("Staff", "edit"),
  toggleStaffActive,
);

/* ===== PERMISSIONS ===== */
router.get("/permissions/me", getMyPermissions); // koi bhi apni khud ki permission dekh sakta hai
router.get(
  "/permissions/:subAdminUserId",
  checkPermission("Staff", "view"),
  getPermissionByUser,
);
router.put(
  "/permissions/:subAdminUserId",
  checkPermission("Staff", "edit"),
  assignPermission,
);

export default router;
