import express from "express";
import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

/* GET — sabko allow (superAdmin + subAdmin), kyunki staff-create form
   me role-dropdown dikhane ke liye subAdmin ko bhi role-list chahiye
   hoti hai (agar unke paas Staff:create permission hai) */
router.get("/", getRoles);

/* Create/Update/Delete — sirf superAdmin (role-management sirf unka kaam hai) */
router.post("/", restrictTo("superAdmin"), createRole);
router.put("/:id", restrictTo("superAdmin"), updateRole);
router.delete("/:id", restrictTo("superAdmin"), deleteRole);

export default router;
