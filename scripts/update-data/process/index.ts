import { DATA_SOURCE_URL } from "../config";
import countries from 'i18n-iso-countries';
import CopilotClient from "../copilot/client";
import {
  extractRelevantHtml,
  normalizeCountryName,
  resolveReference,
  type ParsedReference,
} from "./html";
import { buildPrompt, extractJson, STATUSES, type ParsedMember } from "./copilot";

const main = async (html: string) => {
  const token = process.env.COPILOT_TOKEN;
  if (!token) {
    throw new Error("Missing GitHub Copilot access token. Set COPILOT_TOKEN in the environment.");
  }

  const client = new CopilotClient({
    token,
    model: process.env.COPILOT_MODEL || 'gpt-4o',
  });

  const { fragment, title, $ } = extractRelevantHtml(html);
  const { system, user } = buildPrompt(fragment);

  console.log("=== HTML to be passed to LLM ===");
  console.log(fragment);

  const { content, usage } = await client.chat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { temperature: 0, maxTokens: 16000 },
  );

  if (usage) {
    console.debug(
      `Extraction used ${usage.totalTokens} tokens ` +
      `(prompt=${usage.promptTokens}, completion=${usage.completionTokens}).`
    );
  }

  const parsed = extractJson(content) as { members?: ParsedMember[] };
  const rawMembers = parsed.members ?? [];

  const members = rawMembers
    .filter((m) => m && typeof m.name === "string" && STATUSES.includes(m.status))
    .map((m) => {
      const name = normalizeCountryName(m.name.split('[')[0]);
      const alpha2 = countries.getAlpha2Code(name, 'en') || null;
      const alpha3 = countries.getAlpha3Code(name, 'en') || null;
      const references = Array.isArray(m.citeIds)
        ? m.citeIds
            .map((id) => resolveReference($, id))
            .filter((r): r is ParsedReference => r !== null)
        : [];

      return {
        name,
        alpha2,
        alpha3,
        status: m.status,
        references,
      };
    });

  const result = {
    data: {
      members,
    },
    references: [
      {
        type: 'source',
        link: DATA_SOURCE_URL,
        text: title,
      }
    ],
    retrieval_date: new Date().toISOString(),
  };

  console.log(JSON.stringify(result));

  return result;
};

export default main;
