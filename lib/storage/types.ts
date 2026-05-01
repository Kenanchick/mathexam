export type UploadedFile = {
  url: string; //публичный URL для отдачи (/uploads/... или https://...)
  key: string; //внутренний ключ — путь/идентификатор файла внутри хранилища
  size: number;
  mimeType: string;
};

export type UploadInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  taskId: string;
  kind: "condition" | "solution";
};

export interface TaskImageStorage {
  /** Загрузить файл и вернуть его url + key для сохранения в БД. */
  uploadTaskImage(input: UploadInput): Promise<UploadedFile>;

  /** Удалить файл по url или key. Не должен бросать, если файла уже нет. */
  deleteTaskImage(urlOrKey: string): Promise<void>;

  /** Привести произвольный сохранённый url к публичному (для CDN/прокси). */
  getPublicUrl(urlOrKey: string): string;
}

export const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; //5 MB
