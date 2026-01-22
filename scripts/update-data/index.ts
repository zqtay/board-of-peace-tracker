// npx tsx ./scripts/update-data/index.ts
import fetchHtml from "./fetch";
import process from "./process";
import exportJson from "./export-json";

const main = async () => {
  console.log("Starting data update process...");
  const html = await fetchHtml();
  console.log("HTML fetched successfully.");
  const data: Object = await process(html);
  console.log("Data processing complete.");
  exportJson(data);
  console.log("Data export complete.");
};

main();
