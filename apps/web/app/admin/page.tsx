"use client";
import { useState } from "react"

import SupabaseManagerDialog from "@/components/supabase-manager"
import { Button } from "@workspace/ui/components/button"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

export default function () {
  const [open, setOpen] = useState(false)
  const projectRef = "your-project-ref" // Replace with your actual project ref
  const isMobile = useIsMobile()

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Supabase Manager</Button>
      <SupabaseManagerDialog
        projectRef={projectRef}
        open={open}
        onOpenChange={setOpen}
        isMobile={isMobile}
      />
    </>
  )
}
