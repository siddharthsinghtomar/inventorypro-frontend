import { Wrench } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-brand-500/20">
        <Wrench className="w-10 h-10 text-brand-500" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
        {title} <span className="text-muted-foreground font-medium">Coming Soon</span>
      </h1>
      <p className="text-muted-foreground text-center max-w-md text-sm leading-relaxed mb-8">
        {description || "We're working hard to bring you this feature. It will be available in an upcoming update."}
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-card border border-border shadow-sm text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <ArrowLeft size={16} />
        Return to Dashboard
      </Link>
    </div>
  );
}
