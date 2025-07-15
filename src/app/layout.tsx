import type { Metadata } from "next"
import { type ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/app/providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "TSender",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
