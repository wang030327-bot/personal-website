import type { PropsWithChildren } from "react";

import { Prose } from "@/components/content/prose";

export function RichContent({ children }: PropsWithChildren) {
  return <Prose>{children}</Prose>;
}
