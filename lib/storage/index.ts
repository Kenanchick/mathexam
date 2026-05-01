import type { TaskImageStorage } from "./types";
import { localTaskImageStorage } from "./local";

/**
 * Активный провайдер хранения картинок задач.
 *
 * Сейчас — локальная FS (public/uploads/tasks).
 *
 * Когда потребуется деплой на Vercel, добавьте реализацию интерфейса
 * TaskImageStorage в lib/storage/<provider>.ts и переключите экспорт здесь
 * по флагу из ENV. Сигнатура остаётся той же — админка и страницы задач
 * не меняются.
 */
export const taskImageStorage: TaskImageStorage = localTaskImageStorage;

export type {
  TaskImageStorage,
  UploadInput,
  UploadedFile,
  AllowedMimeType,
} from "./types";

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./types";
