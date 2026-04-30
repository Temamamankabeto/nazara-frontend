"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "am", label: "Amharic" },
  { code: "om", label: "Oromo" },
];

export default function Layout({ children }: AuthLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle(
        "dark",
        savedTheme === "dark"
      );
    }

    const savedLang = localStorage.getItem("language");
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark"
    );
  };

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;

    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-1">
      {/* Main Panel */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Image
              src="/logo.jpg"
              alt="Nazara Detergent Logo"
              width={42}
              height={42}
              priority
              className="rounded-md"
            />

            <span className="text-lg tracking-wide">
              NAZARA DETERGENT SYSTEM
            </span>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-4">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Toggle Light/Dark Mode"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-gray-700" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
            </button>

            {/* Language selector */}
            <select
              value={language}
              onChange={changeLanguage}
              className="rounded-md border border-gray-300 bg-white py-1 px-2 text-sm dark:bg-gray-800 dark:text-gray-100"
              aria-label="Select Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main content container */}
        <main className="flex flex-1 items-center justify-center">

          <div className="w-full max-w-xs flex flex-col items-center gap-4">

            {/* Center Logo */}
            <Image
              src="/logo.jpg"
              alt="Nazara Detergent Logo"
              width={120}
              height={120}
              priority
            />

            {/* Auth content */}
            {children}

          </div>

        </main>
      </div>
    </div>
  );
}