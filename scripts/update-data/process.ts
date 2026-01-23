import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import { DATA_SOURCE_URL } from "./constant";
import countries from 'i18n-iso-countries';

const findFirstElementAfter = ($: cheerio.CheerioAPI, selector: string, targetSelector: string) => {
  const combined = $(`${selector}, ${targetSelector}`);
  const startIndex = combined.index($(selector).first());

  // Get all elements in the set after the start element
  const $targets = combined.slice(startIndex + 1).filter(targetSelector);

  return $targets.first();
};

const normalizeCountryName = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.includes("Vatican")) {
    return "Holy See (Vatican City State)";
  }
  return trimmed;
};

const main = async (html: string) => {
  // Parse HTML
  const $ = cheerio.load(html);

  const title = $('title').text().trim();

  const confirmedList = findFirstElementAfter($, 'p:contains("confirmed their participation")', 'ul');
  const invitedList = findFirstElementAfter($, 'p:contains("not respond yet")', 'ul');
  const declinedList = findFirstElementAfter($, 'p:contains("declined their invitation")', 'ul');
  const withdrawnList = findFirstElementAfter($, 'p:contains("withdrawn")', 'ul');

  const parseCountry = (e: Element) => {
    const $e = $(e);
    const nameText = $e.text().trim().split('[')[0];
    const name = normalizeCountryName(nameText);
    const alpha3 = countries.getAlpha3Code(name, 'en') || null;

    const refIds = (Array.from($e.find("sup a"))).map(a => a.attribs.href);
    const refs = refIds.map(id => {
      const citeEl = $(`[id=${id.split('#')[1]}]`);
      const citeText = citeEl.find('.reference-text').text().trim();
      const citeLink = citeEl.find('a.external').attr('href') || null;
      return {
        text: citeText,
        link: citeLink,
      };
    });

    return {
      name,
      alpha3,
      references: refs,
    };
  };

  const members = [
    ...confirmedList.children('li').map((_, el) => ({ ...parseCountry(el), status: "confirmed" })).get(),
    ...invitedList.children('li').map((_, el) => ({ ...parseCountry(el), status: "invited" })).get(),
    ...declinedList.children('li').map((_, el) => ({ ...parseCountry(el), status: "declined" })).get(),
    ...withdrawnList.children('li').map((_, el) => ({ ...parseCountry(el), status: "withdrawn" })).get(),
  ];

  const result = {
    data: {
      members: members,
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