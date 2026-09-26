import { HomeView, homeMetadata } from "@/views/home";

export const revalidate = 1800;

export function generateMetadata() {
  return homeMetadata("en");
}

export default function Home() {
  return <HomeView lang="en" />;
}
