"use client";

import { useEffect, useState, useTransition, useOptimistic, type ReactElement } from "react";

import { updateProfileAction } from "@/app/actions/profile";
import { trpc } from "@/lib/trpc/react";
import { profileSchema, type ProfileSummary } from "@/lib/validators/profile";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong";
}

export function ProfileForm(): ReactElement {
  const profileQuery = trpc.profile.me.useQuery(undefined, {
    retry: false,
  });
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticName, setOptimisticName] = useOptimistic("", (_, newName: string) => newName);

  const parsedProfile = profileQuery.data
    ? profileSchema.safeParse(profileQuery.data)
    : undefined;
  const profile: ProfileSummary | null = parsedProfile?.success ? parsedProfile.data : null;

  useEffect(() => {
    if (!profile?.name) {
      return;
    }

    setName(profile.name);
    setOptimisticName(profile.name);
  }, [profile?.name, setOptimisticName]);

  useEffect(() => {
    if (!profileQuery.error) {
      return;
    }

    setError(getErrorMessage(profileQuery.error));
  }, [profileQuery.error]);

  async function submit(): Promise<void> {
    setError(null);
    setOptimisticName(name);

    const result = await updateProfileAction({ name });

    if (!result.success) {
      setError(result.error);
    }

    await utils.profile.me.invalidate();
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      void submit().catch((submissionError: unknown) => {
        setError(getErrorMessage(submissionError));
      });
    });
  };

  const isLoading = profileQuery.isLoading || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border p-6 shadow-sm">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Display name
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Your name"
          disabled={isLoading}
        />
      </div>
      <div className="text-sm text-muted-foreground">
        <p className="font-medium">Optimistic preview:</p>
        <p>{optimisticName || '—'}</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
