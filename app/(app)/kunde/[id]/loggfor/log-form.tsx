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

  function applyPreset(text: string) {
    setComment((current) => {
      const trimmed = current.trim();
      if (!trimmed) return text;
      if (trimmed.includes(text)) return current;
      return `${trimmed}\n${text}`;
    });
  }

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
          {visitPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`min-h-12 rounded-2xl px-4 text-meta font-semibold ${outlineActionClass}`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="comment" className={labelClass}>
        Hva ble gjort?
      </label>
      <textarea
        id="comment"
        name="comment"
        rows={6}
        autoFocus
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
