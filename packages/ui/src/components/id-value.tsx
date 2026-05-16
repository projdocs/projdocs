import { Code } from "@packages/ui/components/typography";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { toast } from "sonner";



export const ClickToCopyID = ({ children: id }: {
  children: string
}) => (
  <Tooltip>
    <TooltipContent>{id}</TooltipContent>
    <TooltipTrigger>
      <Code
        className={"cursor-copy"}
        onClick={async (e) => {
          e.stopPropagation();
          e.preventDefault();
          try {
            await navigator.clipboard.writeText(id);
            toast("Copied to Clipboard!");
          } catch (err) {
            console.error(err);
            toast.error(`Failed to Copy: ${err}`);
          }
        }}
      >
        {id.length <= 5 ? id : id.substring(id.length - 5)}
      </Code>
    </TooltipTrigger>
  </Tooltip>
);