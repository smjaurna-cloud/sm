"use client";
import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ nameTh: initial.nameTh, nameEn: initial.nameEn, logoUrl: initial.logoUrl ?? "", palette: initial.palette as PaletteId });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.logoFileTooLarge"));
      e.target.value = "";
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error(t("settings.logoInvalidType"));
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadLogoAction(fd);
      if (!res.ok) {
        toast.error(t(`error.${res.error.code}`) || res.error.message);
        return;
      }
      setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
      toast.success(t("settings.logoUploadOk"));
    } catch {
      toast.error(t("settings.logoUploadFail"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) { setErrors(r.error.fieldErrors ?? {}); if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`)); return; }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("settings.logoUploadHint")} error={errors.logoUrl?.[0]}>
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30 p-1.5 shadow-xs overflow-hidden">
                    {form.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logoUrl} alt={t("settings.logoPreview")} className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          {t("settings.logoUploading")}
                        </>
                      ) : (
                        <>
                          <Upload className="mr-1.5 h-4 w-4" />
                          {t("settings.logoUpload")}
                        </>
                      )}
                    </Button>
                    {form.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        {t("settings.logoRemove")}
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  id="s-logo"
                  type="text"
                  value={form.logoUrl}
                  placeholder="https://... หรือ /uploads/..."
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                />
              </div>
            </LiyonField>
          </div>
        </LiyonCard>
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>
        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}
