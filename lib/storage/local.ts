import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { TaskImageStorage, UploadInput, UploadedFile } from "./types";

const PUBLIC_PREFIX = "/uploads/tasks";

const extByMime: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function getUploadsRoot() {
  return path.join(process.cwd(), "public", "uploads", "tasks");
}

function urlToFsPath(url: string): string | null {
  if (!url.startsWith(PUBLIC_PREFIX + "/")) return null;
  const relative = url.slice(PUBLIC_PREFIX.length + 1);
  return path.join(getUploadsRoot(), relative);
}

export const localTaskImageStorage: TaskImageStorage = {
  async uploadTaskImage(input: UploadInput): Promise<UploadedFile> {
    const ext = extByMime[input.mimeType];
    if (!ext) {
      throw new Error(`Unsupported mime type: ${input.mimeType}`);
    }

    const fileName = `${input.kind}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const dir = path.join(getUploadsRoot(), input.taskId);

    await fs.mkdir(dir, { recursive: true });
    const fsPath = path.join(dir, fileName);
    await fs.writeFile(fsPath, input.buffer);

    const url = `${PUBLIC_PREFIX}/${input.taskId}/${fileName}`;

    return {
      url,
      key: url,
      size: input.buffer.byteLength,
      mimeType: input.mimeType,
    };
  },

  async deleteTaskImage(urlOrKey: string): Promise<void> {
    const fsPath = urlToFsPath(urlOrKey);
    if (!fsPath) return;
    try {
      await fs.unlink(fsPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  },

  getPublicUrl(urlOrKey: string): string {
    return urlOrKey;
  },
};
