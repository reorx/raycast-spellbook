import {
  Action, ActionPanel, Icon, launchCommand, LaunchType, List,
} from "@raycast/api";


// NOTE keep this in sync with quick cast commands in package.json
const quickCastSlots = [
  {
    name: "quick-cast-slot-1",
    title: "Quick Cast Slot 1",
  },
  {
    name: "quick-cast-slot-2",
    title: "Quick Cast Slot 2",
  },
]

export default function QuickCastSlots() {
  return (
    <List>
      {quickCastSlots.map((slot) => (
        <List.Item
          key={slot.name}
          title={slot.title}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action
                  icon={Icon.Pencil}
                  title="Edit Quick Cast Slot"
                  onAction={() => {
                    launchCommand({
                      name: slot.name,
                      type: LaunchType.UserInitiated,
                      context: {
                        openPreferences: true,
                      },
                    })
                  }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
