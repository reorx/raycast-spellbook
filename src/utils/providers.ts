import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { ProviderV1 } from "@ai-sdk/provider";
import { getPreferenceValues } from "@raycast/api";
import { createProviderRegistry } from "ai";
import { readFileSync } from "fs";


const supportedProviders = [
  "anthropic",
  "openai",
  "google",
];

export function getProvider(providerKey: string) {
  const { providersFile } = getPreferenceValues();
  const providersConfig = JSON.parse(readFileSync(providersFile, "utf8"));
  const providerConfig = providersConfig[providerKey];
  if (!providerConfig) {
    throw new Error(`Provider ${providerKey} is not configured`);
  }
  console.log('Provider config', providerConfig);
  let provider: ProviderV1;
  try {
    switch (providerKey) {
      case "anthropic":
        provider = createAnthropic(providerConfig);
        break;
      case "openai":
        provider = createOpenAI(providerConfig);
        break;
      case "google":
        provider = createGoogleGenerativeAI(providerConfig);
        break;
      default:
        throw new Error(`Provider ${providerKey} is not supported`);
    }
  } catch (error) {
    throw new Error(`Error creating provider ${providerKey}: ${error}`);
  }
  return provider;
}

// Currently not used
export function getProviderRegistry() {
  const { providersFile } = getPreferenceValues();
  const providersConfig = JSON.parse(readFileSync(providersFile, "utf8"));

  const providers: Record<string, ProviderV1> = {};
  for (const providerKey of supportedProviders) {
    const providerConfig = providersConfig[providerKey];
    if (!providerConfig) continue;
    let provider: ProviderV1;
    try {
      switch (providerKey) {
        case "anthropic":
          provider = createAnthropic(providerConfig);
          break;
        case "openai":
          provider = createOpenAI(providerConfig);
          break;
        case "google":
          provider = createGoogleGenerativeAI(providerConfig);
          break;
        default:
          throw new Error(`Provider ${providerKey} is not supported`);
      }
    } catch (error) {
      throw new Error(`Error creating provider ${providerKey}: ${error}`);
    }
    providers[providerKey] = provider;
  }

  return createProviderRegistry(providers);
}
