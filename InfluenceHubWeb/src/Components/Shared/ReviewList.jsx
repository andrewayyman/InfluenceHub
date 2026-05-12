import React from "react";
import { StarRating } from "./StarRating";
import { User } from "lucide-react";

export const ReviewList = ({ reviews = [], summary = null }) => {
  if (reviews.length === 0 && !summary) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-400">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-center">
            <p className="text-3xl font-bold ih-text-primary">{summary.averageRating?.toFixed(1) || "0.0"}</p>
            <StarRating rating={summary.averageRating || 0} size={16} />
            <p className="mt-1 text-xs text-slate-400">{summary.totalReviews || 0} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.ratingDistribution?.[star] || 0;
              const total = summary.totalReviews || 1;
              const pct = (count / total) * 100;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-slate-400">{star}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">
                  {review.reviewerName?.charAt(0).toUpperCase() || <User size={14} />}
                </div>
                <div>
                  <p className="text-sm font-medium ih-text-primary">{review.reviewerName}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{review.reviewerRole}</p>
                </div>
              </div>
              <StarRating rating={review.rating} size={14} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{review.comment}</p>
            <p className="mt-2 text-[10px] text-slate-500">
              {review.campaignTitle && <span className="mr-2">Campaign: {review.campaignTitle}</span>}
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
