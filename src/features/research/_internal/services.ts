import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { writeAudit } from "@/features/identity/server";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreatePublicationInput,
  ResearchStatus,
  PublicationType,
} from "./validations";

export interface ResearchProjectDto {
  id: string;
  tenantId: string;
  code: string;
  titleTh: string;
  titleEn: string;
  abstractTh: string | null;
  abstractEn: string | null;
  leaderId: string | null;
  leaderName: string;
  members: string[];
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  budget: number | null;
  fundingSource: string | null;
  startDate: string;
  endDate: string | null;
  status: ResearchStatus;
  coverImageUrl: string | null;
  outputFileUrl: string | null;
  publicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationDto {
  id: string;
  tenantId: string;
  projectId: string | null;
  projectTitleTh: string | null;
  projectTitleEn: string | null;
  title: string;
  authors: string;
  journalOrConference: string;
  publicationType: PublicationType;
  tier: string | null;
  doi: string | null;
  year: number;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchStatsDto {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalPublications: number;
  internationalJournals: number;
}


type ProjectWithRelations = Prisma.ResearchProjectGetPayload<{
  include: {
    department: { select: { nameTh: true; nameEn: true } };
    publications: { select: { id: true } };
  };
}>;

function mapProject(item: ProjectWithRelations): ResearchProjectDto {
  const members = Array.isArray(item.members) ? (item.members as string[]) : [];
  return {
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    abstractTh: item.abstractTh,
    abstractEn: item.abstractEn,
    leaderId: item.leaderId,
    leaderName: item.leaderName,
    members,
    departmentId: item.departmentId,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    budget: item.budget ? Number(item.budget) : null,
    fundingSource: item.fundingSource,
    startDate: item.startDate.toISOString(),
    endDate: item.endDate?.toISOString() ?? null,
    status: item.status as ResearchStatus,
    coverImageUrl: item.coverImageUrl,
    outputFileUrl: item.outputFileUrl,
    publicationsCount: item.publications.length,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

type PublicationWithProject = Prisma.PublicationGetPayload<{
  include: {
    project: { select: { titleTh: true; titleEn: true } };
  };
}>;

function mapPublication(item: PublicationWithProject): PublicationDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    projectId: item.projectId,
    projectTitleTh: item.project?.titleTh ?? null,
    projectTitleEn: item.project?.titleEn ?? null,
    title: item.title,
    authors: item.authors,
    journalOrConference: item.journalOrConference,
    publicationType: item.publicationType as PublicationType,
    tier: item.tier,
    doi: item.doi,
    year: item.year,
    url: item.url,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function listResearchProjects(
  tenantId: string,
  options?: {
    status?: ResearchStatus;
    departmentId?: string;
    search?: string;
  }
): Promise<ResearchProjectDto[]> {
  const where: Prisma.ResearchProjectWhereInput = { tenantId };

  if (options?.status) {
    where.status = options.status;
  }
  if (options?.departmentId) {
    where.departmentId = options.departmentId;
  }
  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { titleTh: { contains: s, mode: "insensitive" } },
      { titleEn: { contains: s, mode: "insensitive" } },
      { leaderName: { contains: s, mode: "insensitive" } },
      { code: { contains: s, mode: "insensitive" } },
    ];
  }

  const items = await prisma.researchProject.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: {
      department: { select: { nameTh: true, nameEn: true } },
      publications: { select: { id: true } },
    },
  });

  return items.map(mapProject);
}

export async function getResearchProjectById(
  tenantId: string,
  id: string
): Promise<ResearchProjectDto | null> {
  const item = await prisma.researchProject.findFirst({
    where: { tenantId, id },
    include: {
      department: { select: { nameTh: true, nameEn: true } },
      publications: { select: { id: true } },
    },
  });
  return item ? mapProject(item) : null;
}

export async function listPublications(
  tenantId: string,
  options?: {
    publicationType?: PublicationType;
    year?: number;
    search?: string;
  }
): Promise<PublicationDto[]> {
  const where: Prisma.PublicationWhereInput = { tenantId };

  if (options?.publicationType) {
    where.publicationType = options.publicationType;
  }
  if (options?.year) {
    where.year = options.year;
  }
  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { authors: { contains: s, mode: "insensitive" } },
      { journalOrConference: { contains: s, mode: "insensitive" } },
    ];
  }

  const items = await prisma.publication.findMany({
    where,
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: {
      project: { select: { titleTh: true, titleEn: true } },
    },
  });

  return items.map(mapPublication);
}

export async function getResearchStats(tenantId: string): Promise<ResearchStatsDto> {
  const [projects, publications] = await Promise.all([
    prisma.researchProject.findMany({
      where: { tenantId },
      select: { status: true, budget: true },
    }),
    prisma.publication.findMany({
      where: { tenantId },
      select: { publicationType: true },
    }),
  ]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget ? Number(p.budget) : 0), 0);
  const totalPublications = publications.length;
  const internationalJournals = publications.filter(
    (pub) => pub.publicationType === "JOURNAL_INTERNATIONAL"
  ).length;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalBudget,
    totalPublications,
    internationalJournals,
  };
}

export async function createResearchProject(
  tenantId: string,
  actorId: string,
  input: CreateProjectInput
): Promise<ResearchProjectDto> {
  return await prisma.$transaction(async (tx) => {
    const created = await tx.researchProject.create({
      data: {
        tenantId,
        code: input.code,
        titleTh: input.titleTh,
        titleEn: input.titleEn,
        abstractTh: input.abstractTh || null,
        abstractEn: input.abstractEn || null,
        leaderId: input.leaderId || null,
        leaderName: input.leaderName,
        members: input.members ?? [],
        departmentId: input.departmentId || null,
        budget: input.budget !== undefined && input.budget !== null ? input.budget : null,
        fundingSource: input.fundingSource || null,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status,
        coverImageUrl: input.coverImageUrl || null,
        outputFileUrl: input.outputFileUrl || null,
      },
      include: {
        department: { select: { nameTh: true, nameEn: true } },
        publications: { select: { id: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "research.project.create",
        entity: "research_project",
        entityId: created.id,
        before: null,
        after: created,
      },
      tx
    );

    return mapProject(created);
  });
}

export async function updateResearchProject(
  tenantId: string,
  actorId: string,
  input: UpdateProjectInput
): Promise<ResearchProjectDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.researchProject.findFirst({
      where: { tenantId, id: input.id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.researchProject.update({
      where: { id: input.id },
      data: {
        code: input.code,
        titleTh: input.titleTh,
        titleEn: input.titleEn,
        abstractTh: input.abstractTh || null,
        abstractEn: input.abstractEn || null,
        leaderId: input.leaderId || null,
        leaderName: input.leaderName,
        members: input.members ?? [],
        departmentId: input.departmentId || null,
        budget: input.budget !== undefined && input.budget !== null ? input.budget : null,
        fundingSource: input.fundingSource || null,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status,
        coverImageUrl: input.coverImageUrl || null,
        outputFileUrl: input.outputFileUrl || null,
      },
      include: {
        department: { select: { nameTh: true, nameEn: true } },
        publications: { select: { id: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "research.project.update",
        entity: "research_project",
        entityId: updated.id,
        before: existing,
        after: updated,
      },
      tx
    );

    return mapProject(updated);
  });
}

export async function deleteResearchProject(
  tenantId: string,
  actorId: string,
  id: string
): Promise<{ success: boolean }> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.researchProject.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    await tx.researchProject.delete({
      where: { id },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "research.project.delete",
        entity: "research_project",
        entityId: id,
        before: existing,
        after: null,
      },
      tx
    );

    return { success: true };
  });
}

export async function createPublication(
  tenantId: string,
  actorId: string,
  input: CreatePublicationInput
): Promise<PublicationDto> {
  return await prisma.$transaction(async (tx) => {
    const created = await tx.publication.create({
      data: {
        tenantId,
        projectId: input.projectId || null,
        title: input.title,
        authors: input.authors,
        journalOrConference: input.journalOrConference,
        publicationType: input.publicationType,
        tier: input.tier || null,
        doi: input.doi || null,
        year: input.year,
        url: input.url || null,
      },
      include: {
        project: { select: { titleTh: true, titleEn: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "research.publication.create",
        entity: "publication",
        entityId: created.id,
        before: null,
        after: created,
      },
      tx
    );

    return mapPublication(created);
  });
}

export async function deletePublication(
  tenantId: string,
  actorId: string,
  id: string
): Promise<{ success: boolean }> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.publication.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    await tx.publication.delete({
      where: { id },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "research.publication.delete",
        entity: "publication",
        entityId: id,
        before: existing,
        after: null,
      },
      tx
    );

    return { success: true };
  });
}
