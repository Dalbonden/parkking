"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signInWithEmail, signUpWithEmail, type AuthState } from "./actions";

const initial: AuthState = { status: "idle" };

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [inState, inAction, inPending] = useActionState(signInWithEmail, initial);
  const [upState, upAction, upPending] = useActionState(signUpWithEmail, initial);

  const isSignin = mode === "signin";
  const state = isSignin ? inState : upState;
  const action = isSignin ? inAction : upAction;
  const pending = isSignin ? inPending : upPending;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={cn(
            "rounded-md py-2 font-medium transition-colors",
            isSignin ? "bg-card shadow-sm" : "text-muted-foreground",
          )}
        >
          Logga in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={cn(
            "rounded-md py-2 font-medium transition-colors",
            !isSignin ? "bg-card shadow-sm" : "text-muted-foreground",
          )}
        >
          Skapa konto
        </button>
      </div>

      <form action={action} className="space-y-3">
        {!isSignin && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Namn</Label>
            <Input id="fullName" name="fullName" placeholder="För- och efternamn" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">E-post</Label>
          <Input id="email" name="email" type="email" placeholder="din@epost.se" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Lösenord</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={isSignin ? "Ditt lösenord" : "Minst 6 tecken"}
            required
          />
        </div>

        {state.status === "error" && state.message && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "…" : isSignin ? "Logga in" : "Skapa konto"}
        </Button>
      </form>
    </div>
  );
}
