import { useEffect } from "react";

import { Detail, getPreferenceValues, getSelectedText } from "@raycast/api";


export default function Command() {
  const pref = getPreferenceValues()
  console.log('run command', pref);
  useEffect(() => {
    console.log('run use effect');
    (async () => {
      try {
        const selection = await getSelectedText()
        console.log('selection:', selection)
      } catch {
        console.error('error')
      }
    })()
  }, [])

  return <Detail markdown="Quick Prompt 2" />;
}
