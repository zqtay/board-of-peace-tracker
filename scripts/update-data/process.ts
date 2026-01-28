import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import { DATA_SOURCE_URL } from "./constant";
import countries from 'i18n-iso-countries';

const findElementAfter = ($: cheerio.CheerioAPI, selector: string, targetSelector: string, index: number = 0) => {
  const combined = $(`${selector}, ${targetSelector}`);
  const startIndex = combined.index($(selector).first());

  // Get all elements in the set after the start element
  const $targets = combined.slice(startIndex + 1).filter(targetSelector);

  return $targets.eq(index);
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

  const accpetedList = findElementAfter($, 'h4:contains("accept")', 'ul');
  const intendToAcceptList = findElementAfter($, 'h4:contains("accept")', 'ul', 1);
  const invitedList = findElementAfter($, 'h4:contains("invitees")', 'ul');
  const withdrawnList = findElementAfter($, 'h4:contains("invitees")', 'ul', 1);
  const declinedList = findElementAfter($, 'h4:contains("invitees")', 'ul', 2);

  const parseCountry = (e: Element) => {
    const $e = $(e);
    const nameText = $e.text().trim().split('[')[0];
    const name = normalizeCountryName(nameText);
    const alpha2 = countries.getAlpha2Code(name, 'en') || null;
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
      alpha2,
      alpha3,
      references: refs,
    };
  };

  const members = [
    ...accpetedList.children('li').map((_, el) => ({ ...parseCountry(el), status: "accepted" })).get(),
    ...intendToAcceptList.children('li').map((_, el) => ({ ...parseCountry(el), status: "intendToAccept" })).get(),
    ...invitedList.children('li').map((_, el) => ({ ...parseCountry(el), status: "invited" })).get(),
    ...withdrawnList.children('li').map((_, el) => ({ ...parseCountry(el), status: "withdrawn" })).get(),
    ...declinedList.children('li').map((_, el) => ({ ...parseCountry(el), status: "declined" })).get(),
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