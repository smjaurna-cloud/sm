"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Pin,
  PinOff,
  Layers,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableColumn,
  RowMenuItem,
  LiyonCard,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  LiyonSwitch,
} from "@/shared/components/liyon";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";
import {
  createNewsArticleAction,
  updateNewsArticleAction,
  deleteNewsArticleAction,
  togglePinNewsArticleAction,
} from "@/features/news/actions";

export interface NewsAdminClientProps {
  initialArticles: NewsArticleDto[];
  categories: NewsCategoryDto[];
  canManage: boolean;
  canPublish: boolean;
}

export function NewsAdminClient({
  initialArticles,
  categories,
  canManage,
  canPublish,
}: NewsAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [articles, setArticles] = useState<NewsArticleDto[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticleDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsArticleDto | null>(null);

  // Form states
  const [formTitleTh, setFormTitleTh] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id ?? "");
  const [formSummaryTh, setFormSummaryTh] = useState("");
  const [formSummaryEn, setFormSummaryEn] = useState("");
  const [formContentTh, setFormContentTh] = useState("");
  const [formContentEn, setFormContentEn] = useState("");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [formIsPinned, setFormIsPinned] = useState(false);

  const openCreateDialog = () => {
    setEditingArticle(null);
    setFormTitleTh("");
    setFormTitleEn("");
    setFormSlug("");
    setFormCategoryId(categories[0]?.id ?? "");
    setFormSummaryTh("");
    setFormSummaryEn("");
    setFormContentTh("");
    setFormContentEn("");
    setFormCoverImageUrl("");
    setFormStatus("DRAFT");
    setFormIsPinned(false);
    setDialogOpen(true);
  };

  const openEditDialog = (art: NewsArticleDto) => {
    setEditingArticle(art);
    setFormTitleTh(art.titleTh);
    setFormTitleEn(art.titleEn);
    setFormSlug(art.slug);
    setFormCategoryId(art.categoryId);
    setFormSummaryTh(art.summaryTh ?? "");
    setFormSummaryEn(art.summaryEn ?? "");
    setFormContentTh(art.contentTh);
    setFormContentEn(art.contentEn);
    setFormCoverImageUrl(art.coverImageUrl ?? "");
    setFormStatus(art.status);
    setFormIsPinned(art.isPinned);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formTitleTh.trim() || !formTitleEn.trim() || !formSlug.trim() || !formCategoryId) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    startTransition(async () => {
      if (editingArticle) {
        const res = await updateNewsArticleAction({
          id: editingArticle.id,
          titleTh: formTitleTh,
          titleEn: formTitleEn,
          slug: formSlug,
          categoryId: formCategoryId,
          summaryTh: formSummaryTh || null,
          summaryEn: formSummaryEn || null,
          contentTh: formContentTh,
          contentEn: formContentEn,
          coverImageUrl: formCoverImageUrl || null,
          status: formStatus,
          isPinned: formIsPinned,
        });

        if (res.ok) {
          toast.success(t("news.updateSuccess"));
          setArticles((prev) =>
            prev.map((item) => (item.id === res.data.id ? res.data : item))
          );
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      } else {
        const res = await createNewsArticleAction({
          titleTh: formTitleTh,
          titleEn: formTitleEn,
          slug: formSlug,
          categoryId: formCategoryId,
          summaryTh: formSummaryTh || null,
          summaryEn: formSummaryEn || null,
          contentTh: formContentTh,
          contentEn: formContentEn,
          coverImageUrl: formCoverImageUrl || null,
          status: formStatus,
          isPinned: formIsPinned,
        });

        if (res.ok) {
          toast.success(t("news.createSuccess"));
          setArticles((prev) => [res.data, ...prev]);
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;

    startTransition(async () => {
      const res = await deleteNewsArticleAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setArticles((prev) => prev.filter((i) => i.id !== deleteConfirmItem.id));
        setDeleteConfirmItem(null);
        router.refresh();
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const handleTogglePin = (art: NewsArticleDto) => {
    startTransition(async () => {
      const newPinned = !art.isPinned;
      const res = await togglePinNewsArticleAction(art.id, newPinned);
      if (res.ok) {
        toast.success("ปรับปรุงสถานะการปักหมุดแล้ว");
        setArticles((prev) =>
          prev.map((i) => (i.id === art.id ? { ...i, isPinned: newPinned } : i))
        );
        router.refresh();
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  // Filtered rows
  const filteredArticles = articles.filter((a) => {
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && a.categoryId !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle =
        a.titleTh.toLowerCase().includes(q) || a.titleEn.toLowerCase().includes(q);
      const matchSlug = a.slug.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug) return false;
    }
    return true;
  });

  const columns: DataTableColumn<NewsArticleDto>[] = [
    {
      key: "pinned",
      header: "",
      className: "w-8 text-center",
      render: (row) =>
        row.isPinned ? (
          <Pin className="h-4 w-4 fill-amber-500 text-amber-500 inline-block" />
        ) : null,
    },
    {
      key: "title",
      header: t("news.titleTh"),
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-sm line-clamp-1">{row.titleTh}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{row.titleEn}</div>
          <div className="text-[10px] text-muted-foreground font-mono">/{row.slug}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.category"),
      className: "nowrap text-xs",
      render: (row) => (
        <span>{locale === "en" ? row.categoryNameEn : row.categoryNameTh}</span>
      ),
    },
    {
      key: "status",
      header: t("news.status"),
      className: "nowrap",
      render: (row) => {
        const tone =
          row.status === "PUBLISHED" ? "ok" : row.status === "DRAFT" ? "warn" : "off";
        return <StatusPill tone={tone}>{t(`news.status.${row.status}`)}</StatusPill>;
      },
    },
    {
      key: "views",
      header: t("news.views"),
      className: "nowrap text-xs text-muted-foreground text-center",
      render: (row) => <span>{row.viewsCount}</span>,
    },
    {
      key: "publishedAt",
      header: t("news.publishedAt"),
      className: "nowrap text-xs text-muted-foreground",
      render: (row) => <span>{formatDate(row.publishedAt, locale)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>{t("news.create")}</span>
          </Button>
        )}
      </div>

      {/* Tools / Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อข่าว..."
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-4 text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">หมวดหมู่: ทั้งหมด</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {locale === "en" ? c.nameEn : c.nameTh}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">สถานะ: ทั้งหมด</option>
          <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
          <option value="DRAFT">{t("news.status.DRAFT")}</option>
          <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
        </select>
      </div>

      {/* Main Table */}
      <LiyonCard>
        <DataTable<NewsArticleDto>
          headHeading={<span>{t("news.title")}</span>}
          state={filteredArticles.length === 0 ? "empty" : "data"}
          rows={filteredArticles}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => window.open(`/news/${row.slug}`, "_blank")}
                      icon={<ExternalLink className="h-4 w-4" />}
                    >
                      ดูหน้าเว็บ
                    </RowMenuItem>
                    {canPublish && (
                      <RowMenuItem
                        onSelect={() => handleTogglePin(row)}
                        icon={
                          row.isPinned ? (
                            <PinOff className="h-4 w-4" />
                          ) : (
                            <Pin className="h-4 w-4" />
                          )
                        }
                      >
                        {row.isPinned ? "ยกเลิกปักหมุด" : "ปักหมุดข่าวเด่น"}
                      </RowMenuItem>
                    )}
                    <RowMenuItem
                      onSelect={() => openEditDialog(row)}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      {t("news.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmItem(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("news.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Layers className="h-10 w-10 text-muted-foreground/50" />,
            title: t("news.empty"),
            description: t("news.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen} wide>
        <LiyonDialogHeader
          title={editingArticle ? t("news.edit") : t("news.create")}
          description={t("news.subtitle")}
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("news.titleTh")} htmlFor="formTitleTh">
              <input
                id="formTitleTh"
                type="text"
                value={formTitleTh}
                onChange={(e) => {
                  setFormTitleTh(e.target.value);
                  if (!editingArticle && !formSlug) {
                    setFormSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    );
                  }
                }}
                placeholder="เช่น ประกาศรับสมัครนักศึกษาใหม่"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("news.titleEn")} htmlFor="formTitleEn">
              <input
                id="formTitleEn"
                type="text"
                value={formTitleEn}
                onChange={(e) => {
                  setFormTitleEn(e.target.value);
                  if (!editingArticle && !formSlug) {
                    setFormSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    );
                  }
                }}
                placeholder="e.g. New Student Admissions Announced"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("news.slug")} htmlFor="formSlug" hint="ตัวอักษรพิมพ์เล็ก ตัวเลข และเครื่องหมายขีด -">
              <input
                id="formSlug"
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. new-student-admissions-2027"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>

            <LiyonField label={t("news.category")} htmlFor="formCategory">
              <LiyonSelect
                id="formCategory"
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === "en" ? c.nameEn : c.nameTh}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("news.summaryTh")} htmlFor="formSummaryTh">
              <textarea
                id="formSummaryTh"
                rows={2}
                value={formSummaryTh}
                onChange={(e) => setFormSummaryTh(e.target.value)}
                placeholder="สรุปย่อข่าว (ภาษาไทย)"
                className="w-full rounded-lg border bg-background p-2.5 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("news.summaryEn")} htmlFor="formSummaryEn">
              <textarea
                id="formSummaryEn"
                rows={2}
                value={formSummaryEn}
                onChange={(e) => setFormSummaryEn(e.target.value)}
                placeholder="Summary in English"
                className="w-full rounded-lg border bg-background p-2.5 text-xs"
              />
            </LiyonField>
          </div>

          <LiyonField label={t("news.contentTh")} htmlFor="formContentTh">
            <textarea
              id="formContentTh"
              rows={4}
              value={formContentTh}
              onChange={(e) => setFormContentTh(e.target.value)}
              placeholder="เนื้อหาข่าวแบบเต็ม (ภาษาไทย)"
              className="w-full rounded-lg border bg-background p-2.5 text-xs"
            />
          </LiyonField>

          <LiyonField label={t("news.contentEn")} htmlFor="formContentEn">
            <textarea
              id="formContentEn"
              rows={4}
              value={formContentEn}
              onChange={(e) => setFormContentEn(e.target.value)}
              placeholder="Full article content in English"
              className="w-full rounded-lg border bg-background p-2.5 text-xs"
            />
          </LiyonField>

          <div className="grid gap-4 sm:grid-cols-3 items-center">
            <div className="sm:col-span-2">
              <LiyonField label={t("news.coverImage")} htmlFor="formCoverImage">
                <input
                  id="formCoverImage"
                  type="url"
                  value={formCoverImageUrl}
                  onChange={(e) => setFormCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>
            </div>

            <div>
              <LiyonField label={t("news.status")} htmlFor="formStatus">
                <LiyonSelect
                  id="formStatus"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                  }
                >
                  <option value="DRAFT">{t("news.status.DRAFT")}</option>
                  <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
                  <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <LiyonSwitch
              id="formIsPinned"
              checked={formIsPinned}
              onCheckedChange={setFormIsPinned}
            />
            <label htmlFor="formIsPinned" className="text-xs font-medium cursor-pointer">
              {t("news.isPinned")} (แสดงบนแบนเนอร์ข่าวเด่นหน้าแรก)
            </label>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isPending}
          >
            {t("news.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {t("news.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirm Dialog */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogHeader
          title={t("news.delete")}
          description={t("news.deleteConfirm")}
        />
        <LiyonDialogBody>
          <p className="text-sm font-semibold">{deleteConfirmItem?.titleTh}</p>
          <p className="text-xs text-muted-foreground mt-1">/{deleteConfirmItem?.slug}</p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("news.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("news.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
