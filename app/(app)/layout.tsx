import { AppShell } from "@/components/app-shell";

export default function LocalSignalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
