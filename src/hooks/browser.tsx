import { useEffect, useState, useRef } from "react";

import { BrowserExtension } from "@raycast/api";


export function useBrowserContent() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        const content = await BrowserExtension.getContent({
          format: "markdown",
        })
        setContent(content);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { browserContent: content, loading, error };
}
