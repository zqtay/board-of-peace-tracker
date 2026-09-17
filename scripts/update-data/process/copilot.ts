export const STATUSES = ["member", "accepted", "observer", "invited", "withdrawn", "declined"] as const;
export type Status = typeof STATUSES[number];

export type ParsedMember = {
  name: string;
  status: Status;
  citeIds?: string[];
};

export const buildPrompt = (fragment: string) => {
  const system = `You are a precise data extraction engine. You are given an HTML fragment from a Wikipedia article. ` +
    `Extract the list of countries/states and their membership status with respect to the "Board of Peace". ` +
    `Return ONLY a JSON object (no prose, no markdown fences) with this exact shape:\n` +
    `{"members":[{"name":string,"status":"member"|"accepted"|"observer"|"invited"|"withdrawn"|"declined","citeIds":string[]}]}\n` +
    `Rules:\n` +
    `- "name" is the English country/state name exactly as written, without citation markers like [1].\n` +
    `- "status" must be one of: member, accepted, observer, invited, withdrawn, declined. ` +
    `Map section headings to these: full members -> member; accepted -> accepted; Observers -> observer; ` +
    `invitees/invited -> invited; withdrawn -> withdrawn; declined -> declined.\n` +
    `- "citeIds" are the citation ids attached to that entry: for each <a href="#..."> link next to the ` +
    `country name, take the value after the '#' (e.g. href="#cite_note-103" -> "cite_note-103").\n` +
    `- If an entry has no citations, use an empty array for "citeIds".\n` +
    `- Include every listed country under every relevant status.`;

  const user = `HTML:\n${fragment}`;

  return { system, user };
};

/**
 * Pull the JSON payload out of the model response, tolerating markdown code
 * fences or surrounding prose.
 */
export const extractJson = (content: string) => {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`No JSON object found in model response: ${content}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
};
