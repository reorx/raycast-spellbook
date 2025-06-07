import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";

import { PromptTemplate } from "../types";


export function PromptTemplateForm({template}: {
  template: PromptTemplate
}) {
  const { handleSubmit, itemProps } = useForm<PromptTemplate>({
    onSubmit(values) {
      showToast({
        style: Toast.Style.Success,
        title: "Template Updated",
        message: `${values.name} has been saved`,
      });
    },
    validation: {
      name: (value) => {
        if (!value || value.trim().length === 0) {
          return "Name is required";
        }
        // Check for invalid filename characters
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(value) || value.charCodeAt(0) < 32) {
          return "Name contains invalid characters for a filename";
        }
        // Check for reserved names (Windows compatibility)
        const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
        if (reservedNames.test(value.trim())) {
          return "Name cannot be a reserved system name";
        }
        // Check length
        if (value.trim().length > 255) {
          return "Name is too long (max 255 characters)";
        }
        return undefined;
      },
      content: FormValidation.Required,
      path: FormValidation.Required,
      model: FormValidation.Required,
      provider: FormValidation.Required,
    },
    initialValues: {
      name: template.name,
      content: template.content,
      path: template.path,
      model: template.model,
      provider: template.provider,
    }
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Template" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Name" placeholder="Template name" {...itemProps.name} />
      <Form.TextArea title="Content" placeholder="Template content..." {...itemProps.content} />
      <Form.TextField title="Path" placeholder="File path" {...itemProps.path} />
      <Form.TextField title="Model" placeholder="LLM model name" {...itemProps.model} />
      <Form.TextField title="Provider" placeholder="LLM provider name" {...itemProps.provider} />
    </Form>
  )
}
