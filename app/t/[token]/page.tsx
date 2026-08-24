import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerMenu } from "./customer-menu";

export const metadata: Metadata = {
  title: "Demo de Mesa 07",
  description: "Prueba el flujo de pedido desde mesa de SIRAY.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TableMenuPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (token !== "demo") {
    notFound();
  }

  return <CustomerMenu />;
}
