import type { ReactNode } from "react"

export const metadata = {
  title: "CREMA — Brand Guidelines Manual",
  description:
    "Living editorial brand manual and design system for CREMA, crafted as a portfolio case study by Proiectum Studio.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
