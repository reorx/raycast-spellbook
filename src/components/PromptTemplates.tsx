import {
  Action, ActionPanel, Clipboard, Detail, getPreferenceValues, Icon, List,
  showToast, useNavigation,
} from "@raycast/api";

import { usePromptTemplates } from "../hooks/templates";
import { defaultPromptTemplate, getSubtitle, toPromptTemplateFormValues } from "../utils/templates";
import { PromptRunner } from "./PromptRunner";
import { PromptTemplateForm } from "./PromptTemplateForm";
import QuickCastSlots from "./QuickCastSlots";


export function PromptTemplates() {
  const { promptTemplatesDir } = getPreferenceValues()
  const { templates, isLoading, error, setUpdatedAt } = usePromptTemplates(promptTemplatesDir)
  const { push } = useNavigation();

  if (error) {
    return <Detail markdown={`# Error loading prompt templates\n\n${error.message}`} />
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search prompt templates..."
      onSearchTextChange={() => {}}
      searchBarAccessory={<List.Dropdown
        tooltip="Select a prompt template"
      />}
    >
      {templates?.map((template) => (
        <List.Item
          key={template.name}
          title={template.name}
          subtitle={getSubtitle(template)}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action
                  icon={Icon.Text}
                  title="Cast Prompt Template"
                  onAction={() => {
                    push(<PromptRunner template={template} />)
                  }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  icon={Icon.Pencil}
                  title="Edit Prompt Template"
                  shortcut={{
                    modifiers: ["cmd"],
                    key: "e",
                  }}
                  onAction={() => {
                    push(<PromptTemplateForm data={toPromptTemplateFormValues(template)} setUpdatedAt={setUpdatedAt} />)
                  }}
                />
                <Action
                  icon={Icon.Plus}
                  title="Create Prompt Template"
                  shortcut={{
                    modifiers: ["cmd"],
                    key: "n",
                  }}
                  onAction={() => {
                    push(<PromptTemplateForm data={toPromptTemplateFormValues(defaultPromptTemplate)} setUpdatedAt={setUpdatedAt} />)
                  }}
                />
                <Action
                  icon={Icon.Hammer}
                  title="Bind to Quick Cast Slot"
                  shortcut={{
                    modifiers: ["cmd"],
                    key: "s",
                  }}
                  onAction={() => {
                    Clipboard.copy(template.name)
                    showToast({
                      title: 'Prompt template name copied',
                    })
                    push(<QuickCastSlots />)
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
