import BijoyaExperience from "@/components/bijoya/BijoyaExperience";
import { greeting } from "@/lib/greeting-config";
import { resolveMediaConfig } from "@/lib/resolve-media";

export default function Home() {
  const media = resolveMediaConfig();

  return <BijoyaExperience media={media} greeting={greeting} />;
}
