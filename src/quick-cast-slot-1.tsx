import { LaunchProps } from "@raycast/api";

import QuickCastCommand from "./components/QuickCastCommand";


export default function Command(props: LaunchProps) {
  return <QuickCastCommand slotNumber={1} {...props} />
}
