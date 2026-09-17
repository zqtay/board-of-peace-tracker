import * as cheerio from 'cheerio';
import { AnyNode } from 'domhandler';
import { DATA_SOURCE_URL } from "../config";

export type ParsedReference = {
  text: string;
  link: string | null;
};

export const normalizeCountryName = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.includes("Vatican")) {
    return "Holy See (Vatican City State)";
  }
  return trimmed;
};

/**
 * Collapse whitespace and drop non-content nodes from an HTML fragment so the
 * prompt stays small.
 */
const cleanHtml = (html: string) => {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Elements that carry no extraction signal but bloat the token count: flag
// images, template style blobs, citation backlinks and bracket decorations.
const NOISE_SELECTOR =
  'img, style, link, script, button, .flagicon, .mw-empty-elt, .cite-bracket, .mw-cite-backlink';

/**
 * Remove every attribute except those in `keep` from an element and all of its
 * descendants. Strips `class`, `style`, `id`, and the large `data-mw` blobs
 * Wikipedia's Parsoid output attaches to almost every node.
 */
const stripAttributes = (
  $: cheerio.CheerioAPI,
  $scope: cheerio.Cheerio<AnyNode>,
  keep: string[],
) => {
  const keepSet = new Set(keep);
  $scope.find('*').addBack().each((_, el) => {
    const attribs = (el as { attribs?: Record<string, string> }).attribs;
    if (!attribs) return;
    for (const name of Object.keys(attribs)) {
      if (!keepSet.has(name)) $(el).removeAttr(name);
    }
  });
};

/**
 * Use cheerio to isolate the "Membership status" section, so only the relevant
 * HTML is sent to the model instead of the entire Wikipedia page. Citation
 * bodies are NOT included — the section keeps the `#cite_note-*` links next to
 * each country, and `resolveReference` looks up the text/link locally after the
 * model responds.
 */
export const extractRelevantHtml = (html: string) => {
  const $ = cheerio.load(html);
  const title = $('title').text().trim() || DATA_SOURCE_URL;

  // Prefer the Parsoid <section> wrapping the membership heading; fall back to
  // the nearest container of the heading anchor, then to the whole body.
  let $section: cheerio.Cheerio<AnyNode> = $('section[aria-labelledby="Membership_status"]');
  if ($section.length === 0) {
    const $heading = $('#Membership_status');
    $section = $heading.closest('section');
    if ($section.length === 0) {
      $section = $heading.parent();
    }
  }
  if ($section.length === 0) {
    return { fragment: cleanHtml($('body').html() ?? html), title, $ };
  }

  // Minify the section: drop noise elements and every attribute except the
  // citation link hrefs (#cite_note-*) that tie a country to its references.
  $section.find(NOISE_SELECTOR).remove();
  stripAttributes($, $section, ['href']);

  const fragment = cleanHtml($.html($section));

  return { fragment, title, $ };
};

/**
 * Resolve a `cite_note-*` id to its reference text and first external link by
 * looking up the citation element in the original document with cheerio.
 */
export const resolveReference = (
  $: cheerio.CheerioAPI,
  id: string,
): ParsedReference | null => {
  const $ref = $(`[id="${id}"]`).first();
  if ($ref.length === 0) return null;
  // Prefer the dedicated reference-text node; fall back to the whole element.
  // Strip the leading "↑" backlink arrow Wikipedia prepends to each citation.
  const $text = $ref.find('.reference-text').first();
  const text = ($text.length ? $text : $ref)
    .text()
    .replace(/\s+/g, ' ')
    .replace(/^↑\s*/, '')
    .trim();
  const link = $ref.find('a[href^="http"]').first().attr('href') || null;
  return { text, link };
};
