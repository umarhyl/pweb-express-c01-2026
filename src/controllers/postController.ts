import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

export const getAllPosts = async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const posts = await prisma.post.findMany({
    where: search
      ? {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "Berhasil mengambil data post", posts);
};

export const createPost = async (req: Request, res: Response) => {
  const { title, content, author } = req.body ?? {};

  if (typeof title !== "string" || title.trim() === "") {
    throw new HttpError(400, "Title wajib berupa string dan tidak boleh kosong");
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: typeof content === "string" && content.trim() ? content.trim() : null,
      author: typeof author === "string" && author.trim() ? author.trim() : undefined,
    },
  });

  sendSuccess(res, 201, "Post berhasil dibuat", post);
};

export const deletePost = async (req: Request, res: Response) => {
  const id = parseId(req.params.id, "Post ID");

  const post = await prisma.post.delete({
    where: { id },
  });

  sendSuccess(res, 200, "Post berhasil dihapus", post);
};
