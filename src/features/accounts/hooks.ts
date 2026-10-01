import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState, useCallback } from "react";

export function useLinkedAccounts() {
  return useQuery(api.plaid.queries.getLinkedAccounts);
}

export function usePlaidLink() {
  const createLinkTokenAction = useAction(api.plaid.actions.createLinkToken);
  const exchangePublicTokenAction = useAction(api.plaid.actions.exchangePublicToken);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLinkToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await createLinkTokenAction();
      setLinkToken(token);
      return token;
    } catch {
      toast.error("Failed to initialize bank connection");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [createLinkTokenAction]);

  const onSuccess = useCallback(
    async (publicToken: string) => {
      try {
        await exchangePublicTokenAction({ publicToken });
        toast.success("Bank account linked successfully");
        setLinkToken(null);
      } catch {
        toast.error("Failed to link bank account");
      }
    },
    [exchangePublicTokenAction]
  );

  const onExit = useCallback(() => {
    setLinkToken(null);
  }, []);

  return { linkToken, isLoading, fetchLinkToken, onSuccess, onExit };
}

export function useAccountActions() {
  const syncBalancesAction = useAction(api.plaid.actions.syncBalances);
  const syncTransactionsAction = useAction(api.plaid.actions.syncTransactions);
  const unlinkAccountMutation = useMutation(api.plaid.queries.unlinkAccount);

  const syncAccount = useCallback(
    async (plaidItemId: Id<"plaidItems">) => {
      try {
        await Promise.all([
          syncBalancesAction({ plaidItemId }),
          syncTransactionsAction({ plaidItemId }),
        ]);
        toast.success("Account synced");
      } catch {
        toast.error("Failed to sync account");
      }
    },
    [syncBalancesAction, syncTransactionsAction]
  );

  const unlinkAccount = useCallback(
    async (plaidItemId: Id<"plaidItems">) => {
      try {
        await unlinkAccountMutation({ plaidItemId });
        toast.success("Account unlinked");
      } catch {
        toast.error("Failed to unlink account");
      }
    },
    [unlinkAccountMutation]
  );

  return { syncAccount, unlinkAccount };
}
