import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  growth?: number;
  trend?: "up" | "down";
}

const StatCard = ({ icon, title, value, growth, trend }: StatCardProps) => {
  const isUp = trend === "up";
  const growthColor = isUp ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-medium text-text-secondary">{title}</h4>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        </div>

        <div className="p-3 rounded-full bg-bg">{icon}</div>
      </div>

      {growth !== undefined && (
        <div className={`text-sm mt-2 font-semibold ${growthColor}`}>
          <span>
            {isUp ? "+" : "-"}
            {growth}%
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
