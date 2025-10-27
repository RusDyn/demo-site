"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useOptimistic,
  type ChangeEvent,
  type ReactElement,
} from "react";

import { updateProfileAction, uploadProfileAvatarAction } from "@/app/actions/profile";
import { trpc } from "@/lib/trpc/react";
import { profileSchema, type ProfileSummary, type ProfileUpdateInput } from "@/lib/validators/profile";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong";
}

function resolvePreviewUrl(image: string | null): string | null {
  if (!image) {
    return null;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return null;
}

export function ProfileForm(): ReactElement {
  const profileQuery = trpc.profile.me.useQuery(undefined, {
    retry: false,
  });
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [optimisticProfile, setOptimisticProfile] = useOptimistic(
    { name: "", image: null as string | null },
    (state, update: Partial<{ name: string; image: string | null }>) => ({
      name: typeof update.name === "string" ? update.name : state.name,
      image: update.image ?? state.image,
    }),
  );

  const parsedProfile = profileQuery.data ? profileSchema.safeParse(profileQuery.data) : undefined;
  const profile: ProfileSummary | null = parsedProfile?.success ? parsedProfile.data : null;
  const email = profile?.email ?? "";

  useEffect(() => {
    if (!profile) {
      return;
    }

    const resolvedName = profile.name ?? "";
    const resolvedImage = profile.image ?? null;
    const previewFromProfile = resolvePreviewUrl(resolvedImage);

    setName(resolvedName);
    setImage(resolvedImage);
    setAvatarPreviewUrl((current) => {
      if (previewFromProfile) {
        return previewFromProfile;
      }

      if (resolvedImage === null) {
        return null;
      }

      return current;
    });
    setOptimisticProfile({
      name: resolvedName,
      image: previewFromProfile ?? (resolvedImage === null ? null : undefined),
    });
  }, [profile, setOptimisticProfile]);

  useEffect(() => {
    if (!profileQuery.error) {
      return;
    }

    setError(getErrorMessage(profileQuery.error));
  }, [profileQuery.error]);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadProfileAvatarAction({ file });

      if (!result.success) {
        setUploadError(result.error);
        return;
      }

      setImage(result.path);
      setAvatarPreviewUrl(result.signedUrl);
      setOptimisticProfile({ image: result.signedUrl });
    } catch (uploadFailure: unknown) {
      setUploadError(getErrorMessage(uploadFailure));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    setImage(null);
    setAvatarPreviewUrl(null);
    setUploadError(null);
    setOptimisticProfile({ image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function submit(): Promise<void> {
    setError(null);

    const displayImage = avatarPreviewUrl ?? resolvePreviewUrl(image);
    setOptimisticProfile({ name, image: displayImage });

    const payload: ProfileUpdateInput = {
      name,
      image: image ?? null,
    };

    const result = await updateProfileAction(payload);

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

  const isLoading = profileQuery.isLoading || isPending || isUploading;
  const previewName = optimisticProfile.name || "—";
  const previewImage = optimisticProfile.image;
  const avatarDisplayUrl = avatarPreviewUrl ?? resolvePreviewUrl(image);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-md border border-border p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            value={email}
            readOnly
            className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground shadow-sm"
            placeholder="Email unavailable"
            disabled
          />
        </div>
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
        <div>
          <span className="block text-sm font-medium text-foreground">Avatar</span>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
              {avatarDisplayUrl ? (
                <Image
                  src={avatarDisplayUrl}
                  alt="Avatar preview"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">No image</span>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted">
                <span>{isUploading ? "Uploading…" : "Upload new"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                />
              </label>
              <button
                type="button"
                className="w-max text-xs text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleRemoveAvatar}
                disabled={isLoading || (!image && !avatarPreviewUrl)}
              >
                Remove avatar
              </button>
              {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Optimistic preview:</p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Optimistic avatar preview"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">No image</span>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{previewName}</p>
            <p className="text-xs text-muted-foreground">{email || "Email unavailable"}</p>
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
