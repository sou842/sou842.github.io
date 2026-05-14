import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ai-layout bg-[#0A0A0A] min-h-screen text-white">
      <TooltipProvider>
        {children}
      </TooltipProvider>
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
}
