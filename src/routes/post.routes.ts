import { Router } from "express";
import { createPost, deletePost, getAllPosts } from "../controllers/postController";

const router = Router();

router.get("/", getAllPosts);
router.post("/", createPost);
router.delete("/:id", deletePost);

export default router;
