import { useLinkedAccounts, useAccountActions } from "./hooks";
import { PlaidLinkButton } from "./PlaidLinkButton";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Landmark,
  RefreshCw,
  Unlink,
  Building2,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

export function AccountsPage() {
  const linkedAccounts = useLinkedAccounts();
  const { syncAccount, unlinkAccount } = useAccountActions();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  if (linkedAccounts === undefined) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  // Calculate net balance across all accounts
  const netBalance = linkedAccounts.reduce((total, item) => {
    return (
      total +
      item.accounts.reduce((sum, acct) => {
        // For credit/loan accounts, balance is what you owe (negative)
        const isDebt =
          acct.type === "credit" || acct.type === "loan";
        const balance = acct.balanceCurrent ?? 0;
        return sum + (isDebt ? -balance : balance);
      }, 0)
    );
  }, 0);

  const handleSync = async (plaidItemId: Id<"plaidItems">) => {
    setSyncingId(plaidItemId);
    await syncAccount(plaidItemId);
    setSyncingId(null);
  };

  const formatLastSynced = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        icon={Landmark}
        title="Accounts"
        description={
          linkedAccounts.length > 0
            ? `${linkedAccounts.length} institution${linkedAccounts.length !== 1 ? "s" : ""} · Net balance: ${formatCurrency(Math.abs(netBalance))}${netBalance < 0 ? " (debt)" : ""}`
            : "Connect your bank accounts to track balances"
        }
        action={<PlaidLinkButton />}
      />

      {linkedAccounts.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <EmptyState
              icon={Building2}
              title="No linked accounts"
              description="Connect a bank account to see your balances and track your net worth."
            />
          </CardContent>
        </Card>
      ) : (
        linkedAccounts.map((item) => {
          const isSyncing = syncingId === item._id;
          return (
            <Card
              key={item._id}
              className="shadow-card transition-shadow hover:shadow-card-hover"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-primary" />
                    {item.institutionName ?? "Unknown Institution"}
                    <Badge variant="secondary" className="font-normal text-xs">
                      {item.status}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      Synced {formatLastSynced(item.lastSyncedAt)}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSync(item._id)}
                            disabled={isSyncing}
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Sync account
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600"
                            onClick={() => unlinkAccount(item._id)}
                          >
                            <Unlink className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Unlink institution
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {item.accounts.map((account) => {
                    const isDebt =
                      account.type === "credit" || account.type === "loan";
                    const balance = account.balanceCurrent;

                    return (
                      <div
                        key={account._id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                            {isDebt ? (
                              <CreditCard className="h-4 w-4 text-gray-500" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {account.name}
                              {account.mask && (
                                <span className="text-gray-400 ml-1">
                                  ····{account.mask}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="secondary"
                                className="font-normal text-[10px] capitalize"
                              >
                                {account.subtype ?? account.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-semibold tabular-nums ${
                              isDebt ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {balance !== undefined
                              ? `${isDebt ? "-" : ""}${formatCurrency(balance)}`
                              : "—"}
                          </div>
                          {account.balanceAvailable !== undefined &&
                            !isDebt && (
                              <div className="text-xs text-gray-400">
                                {formatCurrency(account.balanceAvailable)}{" "}
                                available
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                  {item.accounts.length === 0 && (
                    <div className="text-sm text-gray-400 py-3 text-center">
                      No accounts found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
