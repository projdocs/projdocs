import { ReactNode } from "react";
import { unstable_noStore as noStore } from 'next/cache';
import { EnvScript } from 'next-runtime-env';

export const metadata = {
  title: "ProjDocs",
  description: "A project-oriented document management system!",
};

export default function RootLayout({ children }: { children: ReactNode }) {

  noStore(); // Opt into dynamic rendering

  return (
    <html lang="en">
    <head>
      <EnvScript
        env={{
          SUPABASE_PUBLIC_URL: process.env.SUPABASE_PUBLIC_URL ?? "",
          SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY ?? "",
          MODE: process.env.MODE ?? "standalone",
        }}
      />
    </head>
    <body>{children}</body>
    </html>
  );
}