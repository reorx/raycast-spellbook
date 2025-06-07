import { Detail } from "@raycast/api";

import { useBrowserContent } from "../hooks/browser";
import { useSelection } from "../hooks/selection";
import { PromptTemplate } from "../types";


export function PromptRunner({ template }: {
  template: PromptTemplate
}) {
  const { content, loading: contentLoading, error: contentError } = useBrowserContent();
  const { selection, loading: selectionLoading } = useSelection();
  // console.log(`selection: ---\n${selection}\n---`);
  // console.log(`content: ${content}, selection: ${selection}`);

  if (contentLoading || selectionLoading) {
    return <Detail markdown="Loading..." />;
  }
  if (contentError) {
    return <Detail markdown={`Error loading content: ${contentError}`} />;
  }

  return <Detail markdown={`# Template\n${template.content}\n\n# Selection\n${selection}\n\n# Content\n${content}`} />;
}
