import React from "react";
import { Star } from "lucide-react";

export const StarRating = ({ rating = 0, maxStars = 5, size = 18, interactive = false, onChange }) => {
  const handleClick = (star) => {
    if (interactive && onChange) onChange(star);
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(i + 1)}
            className={`transition-colors ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          >
            <Star
              size={size}
              className={filled ? "fill-amber-400 text-amber-400" : "text-slate-600"}
            />
          </button>
        );
      })}
    </div>
  );
};
