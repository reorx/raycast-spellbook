import { useEffect, useState, useRef } from "react";

import { getSelectedText } from "@raycast/api";


export function useSelection() {
  // wtf
  const [selection, setSelection] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      console.log('useSelection useEffect should call once');
      let _selection = "";
      let hasError = false;
      try {
        _selection = await getSelectedText()
        console.log('got selected text', _selection);
      } catch {
        hasError = true;
        console.info('no selection found');
      }
      if (!hasError) {
        console.log('set selection', _selection);
        setSelection(_selection);
      }
      setLoading(false);
    })();
  }, []);

  return { selection, loading };
}
