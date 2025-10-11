import React from "react";

const StatsCard = ({ icon: Icon, title, value, color, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-lg ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
