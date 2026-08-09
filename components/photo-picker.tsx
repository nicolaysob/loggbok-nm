"use client";

import { useId, useState } from "react";
import { compressImage } from "@/components/compress-image";
import { outlineActionClass } from "@/lib/ui";

const MAX_PHOTOS = 3;

type Preview = {
  key: string;
  file: File;
  url: string;
};

export function PhotoPicker({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputId = useId();
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);

  async function onPick(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const room = MAX_PHOTOS - files.length;
    if (room <= 0) return;

    setBusy(true);
    try {
      const picked = Array.from(fileList).slice(0, room);
      const compressed = await Promise.all(picked.map(compressImage));
      const nextPreviews = compressed.map((file) => ({
        key: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      }));
      setPreviews((current) => [...current, ...nextPreviews]);
      onChange([...files, ...compressed]);
    } finally {
      setBusy(false);
    }
  }

  function remove(key: string) {
    setPreviews((current) => {
      const target = current.find((item) => item.key === key);
      if (target) URL.revokeObjectURL(target.url);
      const next = current.filter((item) => item.key !== key);
      onChange(next.map((item) => item.file));
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className={`inline-flex min-h-16 cursor-pointer items-center justify-center rounded-2xl px-5 text-heading font-semibold ${outlineActionClass} ${
            files.length >= MAX_PHOTOS || busy
              ? "pointer-events-none opacity-50"
              : ""
          }`}
        >
          {busy ? "Behandler …" : "Ta bilde"}
        </label>
        <span className="text-meta text-navy-700">
          {files.length}/{MAX_PHOTOS} · valgfritt
        </span>
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        disabled={busy || files.length >= MAX_PHOTOS}
        onChange={(event) => {
          void onPick(event.target.files);
          event.target.value = "";
        }}
      />

      {previews.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {previews.map((preview) => (
            <li key={preview.key} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt=""
                className="size-24 rounded-xl object-cover shadow-soft"
              />
              <button
                type="button"
                onClick={() => remove(preview.key)}
                className="absolute -top-2 -right-2 flex size-10 items-center justify-center rounded-full bg-navy-900 text-meta font-semibold text-white"
                aria-label="Fjern bilde"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
