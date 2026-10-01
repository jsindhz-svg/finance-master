import { useState, useEffect } from "react";
import { usePlaidLink as useReactPlaidLink } from "react-plaid-link";
import { usePlaidLink } from "./hooks";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

function PlaidLinkOpener({
  token,
  onSuccess,
  onExit,
}: {
  token: string;
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
}) {
  const { open, ready } = useReactPlaidLink({
    token,
    onSuccess: (publicToken) => onSuccess(publicToken),
    onExit,
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return null;
}

export function PlaidLinkButton() {
  const { linkToken, isLoading, fetchLinkToken, onSuccess, onExit } = usePlaidLink();
  const [isExchanging, setIsExchanging] = useState(false);

  const handleClick = async () => {
    await fetchLinkToken();
  };

  const handleSuccess = async (publicToken: string) => {
    setIsExchanging(true);
    await onSuccess(publicToken);
    setIsExchanging(false);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading || isExchanging}
        size="sm"
        className="gap-1.5"
      >
        {isLoading || isExchanging ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {isExchanging ? "Linking..." : "Link Bank Account"}
      </Button>

      {linkToken && (
        <PlaidLinkOpener
          token={linkToken}
          onSuccess={handleSuccess}
          onExit={onExit}
        />
      )}
    </>
  );
}
