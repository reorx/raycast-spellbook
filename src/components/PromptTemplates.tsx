import {
  Action, ActionPanel, Detail, getPreferenceValues, Icon, List, useNavigation,
} from "@raycast/api";

import { usePromptTemplates } from "../hooks/templates";
import { getSubtitle, initPromptTemplate } from "../utils/templates";
import { PromptRunner } from "./PromptRunner";
import { PromptTemplateForm } from "./PromptTemplateForm";


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
                  title="Run Prompt Template"
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
                    push(<PromptTemplateForm template={template} setUpdatedAt={setUpdatedAt} />)
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
                    push(<PromptTemplateForm template={initPromptTemplate()} setUpdatedAt={setUpdatedAt} />)
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
