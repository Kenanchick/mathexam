"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassCard } from "./ClassCard";
import { CreateClassModal, type PersonalStudentOption } from "./CreateClassModal";
import type { TeacherClassDetail } from "../_lib/getTeacherClassesData";

interface TeacherClassesPageProps {
  classes: TeacherClassDetail[];
  personalStudents: PersonalStudentOption[];
}

export const TeacherClassesPage = ({ classes, personalStudents }: TeacherClassesPageProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-start justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Классы</h1>
          <p className="mt-1.5 text-lg text-gray-500">
            {classes.length > 0
              ? `${classes.length} ${pluralizeClasses(classes.length)} · ${sumStudents(classes)} учеников`
              : "Создайте первый класс и пригласите учеников"}
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Создать класс
        </Button>
      </motion.div>

      {classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <GraduationCap className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">
              Классов пока нет
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Создайте класс — ученики смогут вступить по коду приглашения
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="mt-2 gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Создать первый класс
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {classes.map((cls, index) => (
            <ClassCard key={cls.id} cls={cls} index={index} />
          ))}
        </div>
      )}

      <CreateClassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        personalStudents={personalStudents}
      />
    </div>
  );
};

function pluralizeClasses(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "класс";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "класса";
  return "классов";
}

function sumStudents(classes: TeacherClassDetail[]): number {
  return classes.reduce((sum, c) => sum + c.studentCount, 0);
}
