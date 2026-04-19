// npx tsx ./scripts/update-data/index.ts
import fetchHtml from "./fetch";
import process from "./process";
import exportJson from "./export-json";
import { CONFIG_FILE_PATH, DATA_FILE_PATH } from "./constant";
import { statusConfig } from "./config";

const main = async () => {
  console.log("Starting data update process...");
  const html = await fetchHtml();
  console.log("HTML fetched successfully.");
  const data: Object = await process(html);
  console.log("Data processing complete.");
  exportJson(data, DATA_FILE_PATH);
  exportJson(statusConfig, CONFIG_FILE_PATH);
  console.log("Data export complete.");
};

main();
