import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BudgetApp } from "./features/budget/BudgetApp";
import { TargetsGuide } from "./features/targets/TargetsGuide";
import { TransactionsPage } from "./features/transactions/TransactionsPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import { PlanningPage } from "./features/planning/PlanningPage";
import { AccountsPage } from "./features/accounts/AccountsPage";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Calculator,
  Target,
  Landmark,
  Menu,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Budget", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/guide", label: "Targets Guide", icon: Target },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/plan", label: "Planner", icon: Calculator },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function AppSidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-gray-200">
      {/* Branding */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Wallet className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">BudgetZero</span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3">
        <SidebarNav />
      </div>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <SignOutButton variant="sidebar" />
      </div>
    </aside>
  );
}

function MobileHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const currentNav = navItems.find(
    (item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
  );
  const pageTitle = currentNav?.label ?? "BudgetZero";

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-white/80 backdrop-blur-sm px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{pageTitle}</span>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-white p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">BudgetZero</span>
          </div>
          <div className="py-3">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
            <SignOutButton variant="sidebar" />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex w-60 flex-col bg-white border-r border-gray-200 p-6 gap-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-6">
        <div className="mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/30 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-hero">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">BudgetZero</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            Give every dollar
            <br />
            <span className="text-primary/80">a job.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md">
            Take control of your finances with zero-based budgeting.
            Track spending, set targets, and plan ahead.
          </p>
        </div>
      </div>

      {/* Right panel - sign in form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        {/* Mobile branding */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">BudgetZero</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Authenticated>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <MobileHeader />
            <main className="flex-1 overflow-y-auto p-6">
              <div className="w-full animate-fade-in">
                <Content />
              </div>
            </main>
          </div>
        </div>
      </Authenticated>

      <Unauthenticated>
        <UnauthContent />
      </Unauthenticated>

      <Toaster richColors />
    </>
  );
}

function UnauthContent() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return <LoadingSkeleton />;
  }

  return <SignInPage />;
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<BudgetApp />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/guide" element={<TargetsGuide />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/plan" element={<PlanningPage />} />
      <Route path="/accounts" element={<AccountsPage />} />
    </Routes>
  );
}
