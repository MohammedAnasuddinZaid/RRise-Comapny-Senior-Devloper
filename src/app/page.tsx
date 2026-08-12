import type { Metadata } from "next";
import { RriseLanding } from "../components/rrise/RriseLanding";

export const metadata: Metadata = {
  title: "RRise | Rise. Build. Become.",
  description:
    "RRise is a premium personal development workspace built by a high schooler obsessed with bridging the gap between knowing what to do and actually doing it.",
};

export default function HomePage() {
  return <RriseLanding />;
}
