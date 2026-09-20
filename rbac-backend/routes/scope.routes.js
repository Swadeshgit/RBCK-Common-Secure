import express from "express";
import { createScope, getScopes, switchScope } from "../controllers/scope.controller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("superAdmin"), createScope);
router.get("/", getScopes); // superAdmin aur subAdmin dono dekh sakte hain (list filter frontend karega)
router.put("/switch/:id", switchScope); // dono use kar sakte hain, restriction andar hi handle hai

export default router;