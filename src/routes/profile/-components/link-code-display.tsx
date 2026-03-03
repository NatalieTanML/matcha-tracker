import { Copy01Icon, Link01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LinkCodeDisplayProps {
  code: string;
  expiresAt: Date;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function LinkCodeDisplay({ code, expiresAt, onRegenerate, isRegenerating }: LinkCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const fullCommand = `/link ${code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Send this command to the bot:</p>
        <div className="relative rounded-md bg-muted px-3 py-2.5 font-mono text-sm tracking-wider select-all">
          <span className="block w-[calc(100%-2rem)] truncate pr-4">{fullCommand}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground opacity-50 outline-none ring-1 ring-transparent transition-all duration-200 hover:bg-background hover:opacity-100 hover:ring-border focus:opacity-100 focus:ring-border active:opacity-100"
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={16} color="currentColor" />
              </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>{copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-[0.625rem] text-muted-foreground">Expires at {expiresAt.toLocaleTimeString()}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isRegenerating}>
        <HugeiconsIcon icon={Link01Icon} size={16} className="mr-2" />
        {isRegenerating ? "Regenerating..." : "Regenerate code"}
      </Button>
    </div>
  );
}

interface LinkInstructionsProps {
  botUsername: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function LinkInstructions({ botUsername, onGenerate, isGenerating }: LinkInstructionsProps) {
  return (
    <div className="space-y-3">
      <ol className="text-sm text-muted-foreground space-y-2">
        <li className="flex gap-2">
          <span className="font-medium">1.</span>
          Click the button below to generate a link code
        </li>
        <li className="flex gap-2">
          <span className="font-medium">2.</span>
          Start a new chat with{" "}
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sprout-400 hover:underline"
          >
            the Telegram bot
          </a>
        </li>
        <li className="flex gap-2">
          <span className="font-medium">3.</span>
          Send the code using <code className="bg-muted px-1 rounded text-foreground">/link CODE</code>
        </li>
      </ol>
      <Button variant="default" size="sm" onClick={onGenerate} disabled={isGenerating}>
        <HugeiconsIcon icon={Link01Icon} size={16} className="mr-2" />
        {isGenerating ? "Generating..." : "Generate link code"}
      </Button>
    </div>
  );
}
