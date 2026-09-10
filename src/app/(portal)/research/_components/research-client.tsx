"use client";

import { useState } from "react";
import {
  FlaskConical,
  Search,
  BookOpen,
  Award,
  Users,
  Calendar,
  ExternalLink,
  DollarSign,
  FileText,
  FileCheck2,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { StatusPill } from "@/shared/components/liyon/status-pill";
import { LiyonDialog, LiyonDialogHeader, LiyonDialogBody } from "@/shared/components/liyon/liyon-dialog";
import type {
  ResearchProjectDto,
  PublicationDto,
  ResearchStatsDto,
  ResearchStatus,
  PublicationType,
} from "@/features/research";

interface ResearchClientProps {
  projects: ResearchProjectDto[];
  publications: PublicationDto[];
  stats: ResearchStatsDto;
}

export function ResearchClient({ projects, publications, stats }: ResearchClientProps) {
  const t = useT();
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<"projects" | "publications">("projects");
  const [projectSearch, setProjectSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [pubSearch, setPubSearch] = useState("");
  const [pubTypeFilter, setPubTypeFilter] = useState<string>("ALL");

  const [selectedProject, setSelectedProject] = useState<ResearchProjectDto | null>(null);

  // Status Tone Helper
  const getStatusTone = (status: ResearchStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return "ok";
      case "COMPLETED":
        return "info";
      case "PROPOSED":
        return "warn";
      case "CANCELLED":
        return "bad";
      default:
        return "off";
    }
  };

  const getPubTypeTone = (type: PublicationType) => {
    switch (type) {
      case "JOURNAL_INTERNATIONAL":
        return "ok";
      case "PATENT":
        return "warn";
      case "CONFERENCE_INTERNATIONAL":
        return "info";
      default:
        return "off";
    }
  };

  // Filtered Projects
  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      const matchTitle =
        p.titleTh.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.leaderName.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q);
      if (!matchTitle) return false;
    }
    return true;
  });

  // Filtered Publications
  const filteredPubs = publications.filter((pub) => {
    if (pubTypeFilter !== "ALL" && pub.publicationType !== pubTypeFilter) return false;
    if (pubSearch.trim()) {
      const q = pubSearch.toLowerCase();
      const match =
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.journalOrConference.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Banner */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FlaskConical className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("research.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("research.subtitle")}
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("research.totalProjects")}</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("research.activeProjects")}</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("research.totalBudget")}</p>
              <p className="text-2xl font-bold text-foreground">
                {(stats.totalBudget / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("research.totalPublications")}</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPublications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center justify-center border-b pb-px">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "projects"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span>{t("research.projects")} ({projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("publications")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "publications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{t("research.publications")} ({publications.length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Projects */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("research.search")}
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-xs shadow-xs focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "IN_PROGRESS", "COMPLETED", "PROPOSED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {st === "ALL"
                    ? "ทั้งหมด"
                    : st === "IN_PROGRESS"
                    ? t("research.status.in_progress")
                    : st === "COMPLETED"
                    ? t("research.status.completed")
                    : t("research.status.proposed")}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Projects */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center">
              <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">{t("research.empty")}</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((p) => {
                const title = locale === "en" ? p.titleEn : p.titleTh;
                const abstract = locale === "en" ? p.abstractEn : p.abstractTh;

                return (
                  <div
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Cover or placeholder */}
                    <div className="relative h-44 w-full bg-muted">
                      {p.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.coverImageUrl}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/40">
                          <FlaskConical className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="rounded-md bg-background/90 px-2 py-0.5 font-mono text-[10px] font-bold backdrop-blur-xs">
                          {p.code}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <StatusPill tone={getStatusTone(p.status)}>
                          {p.status === "IN_PROGRESS"
                            ? t("research.status.in_progress")
                            : p.status === "COMPLETED"
                            ? t("research.status.completed")
                            : t("research.status.proposed")}
                        </StatusPill>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 text-base font-bold text-foreground hover:text-primary transition">
                        {title}
                      </h3>

                      {abstract && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {abstract}
                        </p>
                      )}

                      <div className="mt-4 space-y-2 border-t pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold text-foreground">{p.leaderName}</span>
                          {p.members.length > 0 && (
                            <span className="text-[11px]">+{p.members.length} ท่าน</span>
                          )}
                        </div>

                        {p.fundingSource && (
                          <div className="flex items-center gap-2">
                            <Award className="h-3.5 w-3.5 text-amber-600" />
                            <span className="line-clamp-1">{p.fundingSource}</span>
                          </div>
                        )}

                        {p.budget && (
                          <div className="flex items-center gap-2 font-mono">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{p.budget.toLocaleString()} บาท</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDate(p.startDate, locale)}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedProject(p)}
                          className="w-full rounded-xl border bg-muted/40 py-2 text-xs font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground shadow-xs"
                        >
                          ดูรายละเอียดและผลงาน
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Publications */}
      {activeTab === "publications" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("research.search")}
                value={pubSearch}
                onChange={(e) => setPubSearch(e.target.value)}
                className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-xs shadow-xs focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                "ALL",
                "JOURNAL_INTERNATIONAL",
                "JOURNAL_NATIONAL",
                "CONFERENCE_INTERNATIONAL",
                "PATENT",
              ].map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setPubTypeFilter(tp)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    pubTypeFilter === tp
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {tp === "ALL"
                    ? "ทั้งหมด"
                    : tp === "JOURNAL_INTERNATIONAL"
                    ? "นานาชาติ (Scopus/WoS)"
                    : tp === "JOURNAL_NATIONAL"
                    ? "ระดับชาติ (TCI)"
                    : tp === "CONFERENCE_INTERNATIONAL"
                    ? "ประชุมนานาชาติ"
                    : "สิทธิบัตร"}
                </button>
              ))}
            </div>
          </div>

          {/* Publications List */}
          {filteredPubs.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">{t("research.pubEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPubs.map((pub) => (
                <div
                  key={pub.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/50 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={getPubTypeTone(pub.publicationType)}>
                        {pub.publicationType === "JOURNAL_INTERNATIONAL"
                          ? t("research.type.journal_international")
                          : pub.publicationType === "JOURNAL_NATIONAL"
                          ? t("research.type.journal_national")
                          : pub.publicationType === "CONFERENCE_INTERNATIONAL"
                          ? t("research.type.conference_international")
                          : t("research.type.patent")}
                      </StatusPill>

                      {pub.tier && (
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          {pub.tier}
                        </span>
                      )}

                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                        {pub.year}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground sm:text-base leading-snug">
                      {pub.title}
                    </h4>

                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">คณะผู้ประพันธ์: </span>
                      {pub.authors}
                    </p>

                    <p className="text-xs text-primary font-medium">
                      {pub.journalOrConference}
                      {pub.doi && <span className="font-mono text-muted-foreground"> • DOI: {pub.doi}</span>}
                    </p>
                  </div>

                  {pub.url && (
                    <div className="shrink-0 pt-1">
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground shadow-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>เปิดดูต้นฉบับ</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Detail Modal */}
      <LiyonDialog
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      >
        <LiyonDialogHeader
          title={selectedProject ? (locale === "en" ? selectedProject.titleEn : selectedProject.titleTh) : ""}
          description={`รหัสโครงการ: ${selectedProject?.code ?? ""}`}
        />
        <LiyonDialogBody className="space-y-5">
          {selectedProject?.coverImageUrl && (
            <div className="relative h-56 w-full overflow-hidden rounded-xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProject.coverImageUrl}
                alt={selectedProject.titleTh}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t("research.abstract")}
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
              {selectedProject ? (locale === "en" ? selectedProject.abstractEn : selectedProject.abstractTh) : ""}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 rounded-xl border bg-muted/30 p-4 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">{t("research.leader")}:</span>
              <p className="font-bold text-foreground mt-0.5">{selectedProject?.leaderName}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">{t("research.fundingSource")}:</span>
              <p className="font-bold text-foreground mt-0.5">{selectedProject?.fundingSource ?? "-"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">{t("research.budget")}:</span>
              <p className="font-mono font-bold text-emerald-600 mt-0.5">
                {selectedProject?.budget ? `${selectedProject.budget.toLocaleString()} บาท` : "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">{t("research.duration")}:</span>
              <p className="font-bold text-foreground mt-0.5">
                {selectedProject && formatDate(selectedProject.startDate, locale)} -{" "}
                {selectedProject?.endDate ? formatDate(selectedProject.endDate, locale) : "ปัจจุบัน"}
              </p>
            </div>
          </div>

          {selectedProject && selectedProject.members.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-foreground">{t("research.members")}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProject.members.map((m) => (
                  <span
                    key={m}
                    className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedProject?.outputFileUrl && (
            <div className="pt-2">
              <a
                href={selectedProject.outputFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary/90"
              >
                <FileText className="h-4 w-4" />
                <span>{t("research.outputFile")}</span>
              </a>
            </div>
          )}
        </LiyonDialogBody>
      </LiyonDialog>
    </div>
  );
}
