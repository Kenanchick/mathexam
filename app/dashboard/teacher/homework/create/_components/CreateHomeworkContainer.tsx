"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HomeworkBasicInfo } from "./HomeworkBasicInfo";
import { HomeworkRecipients, type RecipientMode } from "./HomeworkRecipients";
import { HomeworkTaskSourceSelector, type TaskSource } from "./HomeworkTaskSourceSelector";
import { HomeworkSettings, type HomeworkSettingsValues } from "./HomeworkSettings";
import { HomeworkSummary } from "./HomeworkSummary";
import { createHomework } from "../_actions/createHomework";
import type { CreateHomeworkPageData } from "../_lib/getCreateHomeworkData";

type HomeworkFormState = {
  title: string;
  description: string;
  classroomId: string;
  deadlineDate: string;
  deadlineTime: string;
  recipientMode: RecipientMode;
  selectedStudentIds: string[];
  taskSource: TaskSource;
  selectedTaskIds: string[];
  constructorSlots: Record<number, string | null>;
  settings: HomeworkSettingsValues;
};

function getEffectiveTaskIds(state: HomeworkFormState): string[] {
  if (state.taskSource === "constructor") {
    return Object.values(state.constructorSlots).filter(
      (id): id is string => id !== null,
    );
  }
  return state.selectedTaskIds;
}

function getRecipientCount(
  state: HomeworkFormState,
  data: CreateHomeworkPageData,
): number {
  if (state.recipientMode === "personal") {
    return state.selectedStudentIds.length;
  }
  const classroom = data.classrooms.find((c) => c.id === state.classroomId);
  if (!classroom) return 0;
  if (state.recipientMode === "all") {
    return classroom.students.length;
  }
  return state.selectedStudentIds.length;
}

function getWarnings(
  state: HomeworkFormState,
  taskCount: number,
  recipientCount: number,
): string[] {
  const warnings: string[] = [];
  if (state.recipientMode !== "personal" && !state.classroomId) {
    warnings.push("Выберите класс");
  }
  if (!state.deadlineDate || !state.deadlineTime) warnings.push("Укажите дедлайн");
  if (taskCount === 0) warnings.push("Добавьте хотя бы одну задачу");
  if (
    (state.recipientMode === "selected" || state.recipientMode === "personal") &&
    state.selectedStudentIds.length === 0
  ) {
    warnings.push("Выберите учеников");
  }
  if (
    state.recipientMode !== "personal" &&
    recipientCount === 0 &&
    state.classroomId
  ) {
    warnings.push("В классе нет учеников");
  }
  return warnings;
}

interface CreateHomeworkContainerProps {
  data: CreateHomeworkPageData;
  initialClassroomId: string | null;
}

export const CreateHomeworkContainer = ({
  data,
  initialClassroomId,
}: CreateHomeworkContainerProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [state, setState] = useState<HomeworkFormState>({
    title: "",
    description: "",
    classroomId: initialClassroomId ?? "",
    deadlineDate: "",
    deadlineTime: "23:59",
    recipientMode: "all",
    selectedStudentIds: [],
    taskSource: "manual",
    selectedTaskIds: [],
    constructorSlots: {},
    settings: {
      allowRetries: true,
      showSolutionAfterSubmit: false,
    },
  });

  const update = useCallback(
    <K extends keyof HomeworkFormState>(key: K, value: HomeworkFormState[K]) =>
      setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleClassroomChange = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        classroomId: id,
        selectedStudentIds: [],
      }));
    },
    [],
  );

  const handleStudentToggle = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedStudentIds: prev.selectedStudentIds.includes(id)
        ? prev.selectedStudentIds.filter((s) => s !== id)
        : [...prev.selectedStudentIds, id],
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const classroom = data.classrooms.find((c) => c.id === state.classroomId);
    setState((prev) => ({
      ...prev,
      selectedStudentIds: classroom?.students.map((s) => s.id) ?? [],
    }));
  }, [data.classrooms, state.classroomId]);

  const handleDeselectAll = useCallback(() => {
    setState((prev) => ({ ...prev, selectedStudentIds: [] }));
  }, []);

  const handleTaskToggle = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedTaskIds: prev.selectedTaskIds.includes(id)
        ? prev.selectedTaskIds.filter((t) => t !== id)
        : [...prev.selectedTaskIds, id],
    }));
  }, []);

  const handleSlotChange = useCallback(
    (examNumber: number, taskId: string | null) => {
      setState((prev) => ({
        ...prev,
        constructorSlots: { ...prev.constructorSlots, [examNumber]: taskId },
      }));
    },
    [],
  );

  const handleSettingsUpdate = useCallback(
    (updates: Partial<HomeworkSettingsValues>) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
      }));
    },
    [],
  );

  const taskIds = getEffectiveTaskIds(state);
  const recipientCount = getRecipientCount(state, data);
  const warnings = getWarnings(state, taskIds.length, recipientCount);
  const canPublish = warnings.length === 0;

  const classroomName = useMemo(
    () => data.classrooms.find((c) => c.id === state.classroomId)?.title ?? null,
    [data.classrooms, state.classroomId],
  );

  const submit = async (status: "DRAFT" | "PUBLISHED") => {
    if (status === "PUBLISHED" && !canPublish) return;
    if (!state.title.trim()) {
      setServerError("Введите название домашнего задания");
      return;
    }
    if (state.recipientMode !== "personal" && !state.classroomId) {
      setServerError("Выберите класс");
      return;
    }

    const deadlineAt =
      state.deadlineDate && state.deadlineTime
        ? new Date(`${state.deadlineDate}T${state.deadlineTime}`).toISOString()
        : "";

    setIsSaving(true);
    setServerError(null);

    const result = await createHomework({
      title: state.title.trim(),
      description: state.description || undefined,
      classroomId:
        state.recipientMode === "personal" ? undefined : state.classroomId,
      deadlineAt,
      status,
      recipientMode: state.recipientMode,
      selectedStudentIds: state.selectedStudentIds,
      taskIds,
      settings: state.settings,
    });

    setIsSaving(false);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    if (result.status === "PUBLISHED") {
      router.push("/dashboard/teacher/homework");
    } else {
      router.push("/dashboard/teacher");
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/teacher"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Создать домашнее задание
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Соберите задание для класса или отдельных учеников
            </p>
          </div>
        </div>
      </motion.div>

      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </motion.div>
      )}

      <div className="grid grid-cols-[1fr_340px] items-start gap-6">
        <div className="flex flex-col gap-5">
          <HomeworkBasicInfo
            title={state.title}
            description={state.description}
            classroomId={state.classroomId}
            deadlineDate={state.deadlineDate}
            deadlineTime={state.deadlineTime}
            classrooms={data.classrooms}
            onTitleChange={(v) => update("title", v)}
            onDescriptionChange={(v) => update("description", v)}
            onClassroomChange={handleClassroomChange}
            onDeadlineDateChange={(v) => update("deadlineDate", v)}
            onDeadlineTimeChange={(v) => update("deadlineTime", v)}
          />

          <HomeworkRecipients
            classroomId={state.classroomId}
            classrooms={data.classrooms}
            allStudents={data.allStudents}
            mode={state.recipientMode}
            selectedStudentIds={state.selectedStudentIds}
            onModeChange={(m) => {
              update("recipientMode", m);
              update("selectedStudentIds", []);
            }}
            onStudentToggle={handleStudentToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />

          <HomeworkTaskSourceSelector
            source={state.taskSource}
            tasks={data.tasks}
            topics={data.topics}
            selectedTaskIds={state.selectedTaskIds}
            constructorSlots={state.constructorSlots}
            onSourceChange={(s) => update("taskSource", s)}
            onTaskToggle={handleTaskToggle}
            onSlotChange={handleSlotChange}
          />

          <HomeworkSettings
            settings={state.settings}
            onUpdate={handleSettingsUpdate}
          />
        </div>

        <div className="sticky top-6">
          <HomeworkSummary
            title={state.title}
            classroomName={classroomName}
            recipientMode={state.recipientMode}
            recipientCount={recipientCount}
            taskCount={taskIds.length}
            deadlineDate={state.deadlineDate}
            deadlineTime={state.deadlineTime}
            taskSource={state.taskSource}
            warnings={warnings}
            canPublish={canPublish}
            onSaveDraft={() => submit("DRAFT")}
            onPublish={() => submit("PUBLISHED")}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};
