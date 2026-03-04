import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MagicLinkSentProps {
  description: string;
  onReset: () => void;
}

export function MagicLinkSent({ description, onReset }: MagicLinkSentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Didn't receive it? Check your spam folder or{" "}
          <button className="text-sprout-400 hover:underline" onClick={onReset}>
            try again
          </button>
          .
        </p>
      </CardContent>
    </Card>
  );
}
