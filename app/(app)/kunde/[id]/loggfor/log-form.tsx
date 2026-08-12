"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/validation";
import { createVisitNote } from "@/app/actions/log-entries";
import { visitPresets } from "@/lib/visit-presets";
import { PhotoPicker } from "@/components/photo-picker";
import {
  FieldError,
  StickySubmit,
  labelClass,
  textareaClass,
} from "@/components/mobile-form";
import { outlineActionClass } from "@/lib/ui";

export function LogForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createVisitNote.bind(null, customerId),
    undefined,
  );
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  // Hurtigvalg fungerer som av/på — ett trykk legger til linjen,
  // ett trykk til fjerner den. Da holder hurtigvalg alene for å lagre.
  function togglePreset(text: string) {
    setComment((current) => {
      const lines = current
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.includes(text)) {
        return lines.filter((line) => line !== text).join("\n");
      }
      return [...lines, text].join("\n");
    });
  }

  const activePresets = new Set(
    comment
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );

  function submit(formData: FormData) {
    formData.set("comment", comment);
    formData.delete("photos");
    for (const file of photos) {
      formData.append("photos", file);
    }
    formAction(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-4 pb-4">
      <div className="flex flex-col gap-2">
        <p className={labelClass}>Hurtigvalg</p>
        <div className="flex flex-wrap gap-2">
          {visitPresets.map((preset) => {
            const active = activePresets.has(preset);
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={active}
                onClick={() => togglePreset(preset)}
                className={`min-h-12 rounded-md px-4 text-meta font-semibold transition-all duration-150 ${
                  active
                    ? "border border-brand bg-brand-50 text-green-700"
                    : outlineActionClass
                }`}
              >
                {active ? "✓ " : ""}
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      <label htmlFor="comment" className={labelClass}>
        Hva ble gjort?
      </label>
      <textarea
        id="comment"
        name="comment"
        rows={6}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className={textareaClass}
      />

      <FieldError messages={state?.errors?.comment} />

      <div className="flex flex-col gap-2">
        <p className={labelClass}>Bilder</p>
        <PhotoPicker files={photos} onChange={setPhotos} />
      </div>

      <FieldError messages={state?.errors?.photos} />
      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Lagre besøk</StickySubmit>
    </form>
  );
}
