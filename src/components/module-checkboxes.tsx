"use client";

import { MODULES } from "@/lib/modules";

export function ModuleCheckboxes({
  value,
  locked = [],
  disabled = [],
}: {
  value: string[];
  locked?: string[];
  disabled?: string[];
}) {
  return (
    <div className="space-y-2">
      {MODULES.map((m) => {
        const isLocked = locked.includes(m.key);
        const isDisabled = disabled.includes(m.key) || isLocked;
        return (
          <label
            key={m.key}
            className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
              isDisabled ? "border-slate-200 bg-slate-50 text-slate-500" : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            <input
              type="checkbox"
              name="modules"
              value={m.key}
              defaultChecked={value.includes(m.key)}
              disabled={isDisabled}
              className="mt-0.5"
            />
            <span>
              {m.label}
              {isLocked && <span className="ml-1 text-xs text-slate-400">(always on)</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}