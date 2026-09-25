"use client";
import { saveSettingsAction } from "@/app/admin/actions";
import { ActionForm } from "./forms";

export function SettingsForm({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <ActionForm action={saveSettingsAction}>
      <input type="hidden" name="section" value={section} />
      {children}
    </ActionForm>
  );
}
