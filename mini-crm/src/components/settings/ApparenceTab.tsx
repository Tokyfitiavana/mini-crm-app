import { useState, useEffect } from "react";
import { Sun, Moon, Palette } from "lucide-react";

const ApparenceTab = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [accentColor, setAccentColor] = useState(
    localStorage.getItem("accentColor") || "#8b5cf6"
  );

  const accentColors = [
    { name: "Violet", color: "#8b5cf6" },
    { name: "Bleu", color: "#3b82f6" },
    { name: "Vert", color: "#22c55e" },
    { name: "Orange", color: "#f97316" },
    { name: "Rose", color: "#ec4899" },
  ];

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.setProperty("--color-primary", accentColor);
    localStorage.setItem("theme", theme);
    localStorage.setItem("accentColor", accentColor);
  }, [theme, accentColor]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Apparence</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-text-primary">Thème</h3>
          <p className="text-sm text-text-secondary mt-1">
            Choisissez comment le CRM s'affiche pour vous.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme("dark")}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                theme === "dark"
                  ? "border-primary ring-2 ring-primary"
                  : "border-border"
              }`}
            >
              <Moon size={24} />
              <span className="font-semibold">Sombre</span>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                theme === "light"
                  ? "border-primary ring-2 ring-primary"
                  : "border-border"
              }`}
            >
              <Sun size={24} />
              <span className="font-semibold">Clair</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-lg font-medium text-text-primary">
            Couleur d'accentuation
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Appliquez votre couleur préférée sur les boutons, les liens et
            autres éléments.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {accentColors.map((colorInfo) => (
              <button
                key={colorInfo.name}
                onClick={() => setAccentColor(colorInfo.color)}
                className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 ${
                  accentColor === colorInfo.color
                    ? "ring-2 ring-offset-2 ring-offset-card ring-white"
                    : ""
                }`}
                style={{ backgroundColor: colorInfo.color }}
                aria-label={`Choisir la couleur ${colorInfo.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApparenceTab;
