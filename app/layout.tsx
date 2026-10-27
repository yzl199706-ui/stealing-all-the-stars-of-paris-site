import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "如果麦田还记得你 | If the Wheat Field Remembers You",
  description: "安娜与艾利克斯的故事。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
