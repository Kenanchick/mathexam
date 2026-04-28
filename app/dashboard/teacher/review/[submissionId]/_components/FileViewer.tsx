"use client";

import { ExternalLink, Download, FileText, MessageSquare } from "lucide-react";

interface FileViewerProps {
  fileUrls: string[];
  studentComment: string | null;
  taskNumber: number;
}

export const FileViewer = ({ fileUrls, studentComment, taskNumber }: FileViewerProps) => {
  const noContent = fileUrls.length === 0 && !studentComment;
  if (noContent) return null;

  return (
    <div className="space-y-3">
      {/* Student comment */}
      {studentComment && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
            <p className="text-xs font-semibold text-blue-600">Комментарий ученика</p>
          </div>
          <p className="text-sm text-blue-900">{studentComment}</p>
        </div>
      )}

      {/* Files */}
      {fileUrls.map((url, i) => {
        const extension = url.split(".").pop()?.toUpperCase() ?? "FILE";
        const label =
          fileUrls.length > 1
            ? `Файл ${i + 1} · Задание ${taskNumber}`
            : `Решение задания ${taskNumber}`;

        return (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex flex-col items-center justify-center gap-3 bg-gray-50 px-6 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Прикреплённый файл · {extension}
                </p>
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 p-3">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Открыть файл
              </a>
              <a
                href={url}
                download
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100"
              >
                <Download className="h-3.5 w-3.5" />
                Скачать
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};
