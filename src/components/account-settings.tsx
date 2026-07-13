"use client";

import * as React from "react";
import { Camera, Trash2, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile, setNotificationsEnabled } from "@/lib/actions";

/** Resize an image file to a square data URL (max 256px, JPEG). */
function resizeToDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported"));
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AccountSettings({
  name,
  email,
  image,
  notificationsEnabled,
}: {
  name: string;
  email: string;
  image: string | null;
  notificationsEnabled: boolean;
}) {
  const [preview, setPreview] = React.useState<string | null>(image);
  const [nameValue, setNameValue] = React.useState(name);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [notifOn, setNotifOn] = React.useState(notificationsEnabled);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await resizeToDataUrl(file);
      setPreview(dataUrl);
    } catch {
      setError("Could not process that image.");
    }
  }

  async function saveProfile() {
    setSavingProfile(true);
    setError(null);
    const fd = new FormData();
    if (nameValue.trim()) fd.set("name", nameValue.trim());
    if (preview && preview !== image) fd.set("image", preview);
    else if (!preview && image) fd.set("image", "__clear__");
    try {
      await updateProfile(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function toggleNotifications() {
    const next = !notifOn;
    setNotifOn(next);
    await setNotificationsEnabled(next);
  }

  const initial = (nameValue || email || "?").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPick}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" /> Upload photo
              </Button>
              {preview && (
                <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>

          <div className="max-w-sm">
            <Label className="mb-1.5 block">Full name</Label>
            <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
          </div>
          <div className="max-w-sm">
            <Label className="mb-1.5 block">Email</Label>
            <Input value={email} disabled />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">In-app notifications</p>
              <p className="text-sm text-muted-foreground">
                Alerts for overdue tasks, upcoming due dates and open RFIs.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={notifOn}
              onClick={toggleNotifications}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                notifOn ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  notifOn ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
