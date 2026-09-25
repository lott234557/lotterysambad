"use client";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import type { ActionState } from "@/app/admin/actions";

export function SubmitButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn btn-blue disabled:opacity-70 ${className}`}>
      {pending && <Loader2 className="size-4 animate-spin" />} {children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="flex items-center gap-2 rounded-xl bg-live/10 px-3 py-2 text-sm font-semibold text-live">
        <AlertCircle className="size-4" /> {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p className="flex items-center gap-2 rounded-xl bg-ok/10 px-3 py-2 text-sm font-semibold text-ok">
        <CheckCircle2 className="size-4" /> {state.message ?? "Saved"}
        {state.url && (
          <a href={state.url} target="_blank" className="ml-2 inline-flex items-center gap-1 underline">
            View <ExternalLink className="size-3" />
          </a>
        )}
      </p>
    );
  return null;
}

/** Generic form bound to a server action with inline success / error message. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save changes",
  className = "",
  flash,
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  flash?: string;
}) {
  const [state, formAction] = useActionState(action, flash ? { ok: true, message: flash } : {});
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.ok || state.error) top.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [state]);
  return (
    <form action={formAction} className={`space-y-6 ${className}`}>
      <div ref={top} />
      {children}
      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3 backdrop-blur">
        <SubmitButton>{submitLabel}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function ConfirmButton({ children, message, className = "" }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function CopyField({ value, secret = false }: { value: string; secret?: boolean }) {
  const [show, setShow] = useState(!secret);
  const [copied, setCopied] = useState(false);
  const shown = show ? value : value.replace(/key=[^&]+/, "key=••••••••");
  return (
    <div className="flex items-center gap-2">
      <code className="num block min-w-0 flex-1 truncate rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-xs">{shown}</code>
      {secret && (
        <button type="button" onClick={() => setShow(!show)} className="btn btn-ghost !px-3 !py-2 text-xs">
          {show ? "Hide" : "Show"}
        </button>
      )}
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="btn btn-ghost !px-3 !py-2 text-xs"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
