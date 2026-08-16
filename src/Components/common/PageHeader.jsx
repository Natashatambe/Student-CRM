import React from "react";

export function PageHeader({ title, description, categoryTag, badgeText, primaryAction, secondaryActions, actions, children }) {
  const badge = categoryTag || badgeText;
  const actionContent = actions || children;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#cc785c] font-bold text-2xl">✱</span>
          <h1 className="text-3xl md:text-4xl font-normal text-[#141413] tracking-tight font-serif-display">
            {title}
          </h1>
          {badge && (
            <span className="text-[11px] font-bold bg-[#efe9de] text-[#cc785c] border border-[#e6dfd8] px-2.5 py-0.5 rounded-full font-mono">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-[#6c6a64] font-medium mt-1">
            {description}
          </p>
        )}
      </div>

      {(primaryAction || secondaryActions || actionContent) && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {secondaryActions}
          {actionContent}
          {primaryAction}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
