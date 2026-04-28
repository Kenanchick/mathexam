import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto grid h-16 w-full max-w-[1360px] grid-cols-[1fr_auto_1fr] items-center px-6">
        <Link href="/">
          <h1 className="justify-self-start text-2xl font-bold">MathExam</h1>
        </Link>
        <ul className="flex items-center gap-8 justify-self-center">
          <li>Возможности</li>
          <li>Для учеников</li>
          <li>Для учителя</li>
          <li>Тарифы</li>
        </ul>

        <div className="flex items-center gap-2 justify-self-end">
          <Button variant="outline" asChild>
            <Link href="/login">Войти</Link>
          </Button>

          <Button asChild>
            <Link href="/register">Зарегистрироваться</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
