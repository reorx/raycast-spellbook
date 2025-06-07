import {
  Action, ActionPanel, Form, getPreferenceValues, showToast, Toast, useNavigation,
} from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";

import { PromptTemplate, PromptTemplateFormValues } from "../types";
import { createOrUpdatePromptTemplate } from "../utils/templates";


export function PromptTemplateForm({template, setUpdatedAt}: {
  template: PromptTemplate|PromptTemplateFormValues
  setUpdatedAt: (updatedAt: number) => void
}) {
  const { promptTemplatesDir } = getPreferenceValues()
  const { pop } = useNavigation()
  const initialValues = Object.assign({}, template)

  const { handleSubmit, itemProps } = useForm<PromptTemplateFormValues>({
    onSubmit(values) {
      createOrUpdatePromptTemplate(values, initialValues, promptTemplatesDir).then(() => {
        showToast({
          style: Toast.Style.Success,
          title: "Template Updated",
          message: `${values.name} has been saved`,
        });
        setUpdatedAt(Date.now())
        pop()
      }).catch((error) => {
        console.error(error)
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: `Error saving template: ${error}`,
        });
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
      model: FormValidation.Required,
      provider: FormValidation.Required,
    },
    initialValues,
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
      <Form.TextField title="Provider" placeholder="LLM provider name" {...itemProps.provider} />
      <Form.TextField title="Model" placeholder="LLM model name" {...itemProps.model} />
    </Form>
  )
}
