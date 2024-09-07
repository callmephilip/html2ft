import * as cheerio from "cheerio";

export function html2ft(html: string, attr1st: boolean = false): string {
  const $ = cheerio.load('<h2 class="title">Hello world</h2>');
  $("h2.title").text("Hello there!");
  $("h2").addClass("welcome");
  return $.html();
}
