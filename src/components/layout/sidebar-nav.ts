import { LayoutDashboard, Users, Settings, Layers, Newspaper, Contact, BookOpen, CalendarCheck, FlaskConical, FileCheck, Landmark, Target, type LucideIcon } from "lucide-react";
import { hasPermission, P } from "@/features/identity";
import { SAMPLE_P } from "@/features/sample";
import { NEWS_P } from "@/features/news";
import { STAFF_P } from "@/features/staff";
import { CURRICULUM_P } from "@/features/curriculum";
import { BOOKING_P } from "@/features/booking";
import { RESEARCH_P } from "@/features/research";
import { EDOC_P } from "@/features/edoc";
import { FINANCE_P } from "@/features/finance";
import { STRATEGY_P } from "@/features/strategy";

export interface NavItem {
  /** i18n key */
  title: string;
  href: string;
  icon?: LucideIcon;
  /** ต้องมีสิทธิ์นี้ถึงเห็น — ไม่มี = ทุกคนที่ login เห็น */
  permission?: string;
  children?: NavItem[];
}
export interface NavGroup { label: string; items: NavItem[] }
export interface NavCrumb { title: string; href: string }

export const sidebarGroups: NavGroup[] = [
  { label: "nav.group.overview", items: [{ title: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "roles.module.finance",
    items: [{ title: "finance.nav", href: "/admin/finance", icon: Landmark, permission: FINANCE_P.financeRead }],
  },
  {
    label: "roles.module.strategy",
    items: [{ title: "strategy.nav", href: "/admin/strategy", icon: Target, permission: STRATEGY_P.strategyRead }],
  },
  {
    label: "roles.module.edoc",
    items: [{ title: "edoc.nav", href: "/admin/edoc", icon: FileCheck, permission: EDOC_P.edocRead }],
  },
  {
    label: "roles.module.research",
    items: [{ title: "research.nav", href: "/admin/research", icon: FlaskConical, permission: RESEARCH_P.researchRead }],
  },
  {
    label: "roles.module.booking",
    items: [{ title: "booking.nav", href: "/admin/booking", icon: CalendarCheck, permission: BOOKING_P.bookingRead }],
  },
  {
    label: "roles.module.curriculum",
    items: [{ title: "curriculum.nav", href: "/admin/curriculum", icon: BookOpen, permission: CURRICULUM_P.curriculumRead }],
  },
  {
    label: "roles.module.news",
    items: [{ title: "news.nav", href: "/admin/news", icon: Newspaper, permission: NEWS_P.newsRead }],
  },
  {
    label: "roles.module.staff",
    items: [{ title: "staff.nav", href: "/admin/staff", icon: Contact, permission: STAFF_P.staffRead }],
  },
  {
    label: "nav.group.sample",
    items: [{ title: "sample.nav", href: "/sample", icon: Layers, permission: SAMPLE_P.sampleRead }],
  },
  {
    label: "nav.group.users",
    items: [{
      title: "nav.users", href: "/users", icon: Users, permission: P.usersRead,
      children: [
        { title: "nav.users", href: "/users", permission: P.usersRead },
        { title: "nav.roles", href: "/users/roles", permission: P.rolesManage },
      ],
    }],
  },
  { label: "nav.group.settings", items: [{ title: "nav.settings", href: "/settings", icon: Settings, permission: P.settingsManage }] },
];

type Ctx = Parameters<typeof hasPermission>[0];

function visibleItem(item: NavItem, ctx: Ctx): NavItem | null {
  if (item.permission && !hasPermission(ctx, item.permission)) return null;
  if (!item.children) return item;
  const children = item.children.filter((c) => !c.permission || hasPermission(ctx, c.permission));
  return children.length ? { ...item, children } : null;
}

export function visibleGroups(ctx: Ctx): NavGroup[] {
  return sidebarGroups
    .map((g) => ({ ...g, items: g.items.map((i) => visibleItem(i, ctx)).filter((i): i is NavItem => i !== null) }))
    .filter((g) => g.items.length > 0);
}

/** สายเมนูสำหรับ breadcrumb — จับ href ที่ยาวที่สุดที่ตรง (ลูกชนะแม่) */
export function getActiveNavChain(pathname: string): NavCrumb[] {
  let best: { parent: NavItem | null; item: NavItem } | null = null;
  const consider = (item: NavItem, parent: NavItem | null) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.item.href.length || (item.href.length === best.item.href.length && parent)) best = { parent, item };
    }
  };
  for (const g of sidebarGroups) for (const i of g.items) { consider(i, null); for (const c of i.children ?? []) consider(c, i); }
  if (!best) return [];
  const { parent, item } = best as { parent: NavItem | null; item: NavItem };
  const chain: NavCrumb[] = [];
  if (parent && parent.href !== item.href) chain.push({ title: parent.title, href: parent.href });
  chain.push({ title: item.title, href: item.href });
  return chain;
}
