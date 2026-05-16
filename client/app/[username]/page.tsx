import type { Metadata } from "next";
import { UserProfile } from "@/components/features/Profile/UserProfile";
import { use } from "react";

export const metadata: Metadata = {
  title: "Profile - Koottam",
  description: "View Koottam profile.",
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  return <UserProfile username={resolvedParams.username} />;
}
