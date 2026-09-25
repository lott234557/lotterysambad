"use client";
import { useActionState, useState } from "react";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { SubmitButton, FormMessage } from "./forms";

export function LoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  const [user, setUser] = useState("");
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">Username</span>
        <input name="username" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" required className="h-12 w-full rounded-xl border border-line bg-surface-2 px-4 outline-none focus:border-brand-2" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="h-12 w-full rounded-xl border border-line bg-surface-2 px-4 outline-none focus:border-brand-2" />
      </label>
      <SubmitButton className="h-12 w-full">Sign in</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
