"use client";

import { Check, Edit2, Loader2, Share2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore, useUser } from "@/stores/app-store";

interface ProfileActionsProps {
  isOwner: boolean;
  username: string;
  profileUrl: string;
}

export function ProfileActions({ isOwner, username, profileUrl }: ProfileActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${username}'s Profile | Grand CP`,
          text: `Check out ${username}'s competitive programming progress on Grand CP!`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setShareMessage("Link copied to clipboard!");
        setTimeout(() => setShareMessage(null), 2000);
      }
    } catch (error) {
      console.error("Share failed", error);
      // User cancelled share or error
      await navigator.clipboard.writeText(profileUrl);
      setShareMessage("Link copied to clipboard!");
      setTimeout(() => setShareMessage(null), 2000);
    }
  };

  // Store actions
  const setUser = useAppStore((s) => s.setUser);
  const user = useUser();

  const handleSaveUsername = async () => {
    if (newUsername === username) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to update username");
        return;
      }

      setIsEditing(false);
      
      // Update store immediately
      if (user) {
        setUser({ ...user, username: newUsername });
      }

      // Navigate to new profile URL
      router.push(`/u/${newUsername}`);
      router.refresh();
    } catch (error) {
      console.error("Username update error", error);
      setError("Failed to update username");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNewUsername(username);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Username Editor (only for owner) */}
      {isOwner && (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">@</span>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="username"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleSaveUsername}
                  disabled={isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-status-solved text-white transition-colors hover:bg-status-solved/80 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {error && <span className="mt-1 text-destructive text-xs">{error}</span>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Edit2 className="h-4 w-4" />
              Edit Username
            </button>
          )}
        </div>
      )}

      {/* Share Button */}
      <div className="relative">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          <Share2 className="h-4 w-4" />
          Share Profile
        </button>
        {shareMessage && (
          <div className="absolute top-full right-0 z-10 mt-2 whitespace-nowrap rounded-md bg-status-solved px-3 py-1 text-white text-xs">
            {shareMessage}
          </div>
        )}
      </div>
    </div>
  );
}
