import { Spinner } from "@packages/ui/components/spinner";



export default function Loading() {
  return (
    <div className="flex w-full h-full flex-col items-center justify-center">
      <Spinner className={"size-20"} />
    </div>
  );
}