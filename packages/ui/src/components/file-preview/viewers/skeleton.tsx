import { Viewer } from "@packages/ui/components/file-preview/types";
import { Skeleton as S } from "@packages/ui/components/skeleton";



export const Skeleton: Viewer = () => (
  <S className={"w-full h-full"} />
);

Skeleton.isSupported = () => true;