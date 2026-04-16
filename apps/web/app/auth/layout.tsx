import { LayoutProps } from "@/lib/types/layout";

export default function ({ children }: LayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      {children}
    </div>
  );
}
