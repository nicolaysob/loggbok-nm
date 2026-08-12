"use client";

import { useState, useTransition } from "react";
import { sendTestPush } from "@/app/actions/test-push";
import { outlineActionClass } from "@/lib/ui";

export function TestPushButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        className={`min-h-14 rounded-md px-4 text-body font-semibold ${outlineActionClass} disabled:opacity-60`}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await sendTestPush();
            setOk(result.ok);
            setMessage(result.message);
          });
        }}
      >
        {pending ? "Sender …" : "Send testvarsel til meg"}
      </button>
      {message && (
        <p
          role="status"
          className={`text-meta ${ok ? "text-green-700" : "text-red-700"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
