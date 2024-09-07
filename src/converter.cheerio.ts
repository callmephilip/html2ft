// import * as cheerio from "cheerio";
import { parse } from "node-html-parser";

export function html2ft(html: string, attr1st: boolean = false): string {
  const root = parse(html);
  console.log("html2ft: ", root);
  return "<div>hello from node-html-parser</div>";
}

// export function html2ft(html: string, attr1st: boolean = false): string {
//   const $ = cheerio.load(html);

//   console.log("html2ft: ", $.root()[0]);

//   // $("h2.title").text("Hello there!");
//   // $("h2").addClass("welcome");
//   return $.html();
// }

// import cheerio from 'cheerio';

// interface Attributes {
//   [key: string]: string | string[];
// }

// export function html2ft(html: string, attr1st: boolean = false): string {
//   const revMap: { [key: string]: string } = { class: "cls", for: "fr" };

//   function _parse(
//     elm: cheerio.Cheerio<any> | any | string,
//     lvl: number = 0,
//     indent: number = 4
//   ): string {
//     if (typeof elm === "string") return JSON.stringify(elm.trim()) || "";

//     const $ = cheerio.load("");
//     const $elm = $(elm);

//     if ($elm.length === 0) return "";

//     const tagName = $elm[0].name.toLowerCase().replace(/-/g, "_");
//     if (tagName === "root") return _parse($elm.children().toArray(), lvl);

//     const cts = $elm.contents().toArray();
//     const cs = cts
//       .map((c) => {
//         if (c.type === "text") return JSON.stringify($(c).text().trim());
//         return _parse(c, lvl + 1);
//       })
//       .filter((c) => c);

//     const attrs: string[] = [];
//     const elmAttrs = Object.keys($elm[0].attribs).sort((a, b) =>
//       a === "class" ? -1 : b === "class" ? 1 : 0
//     );

//     for (const key of elmAttrs) {
//       const value = $elm.attr(key);
//       if (value === undefined) continue;

//       const mappedKey = revMap[key] || key;
//       const formattedKey = mappedKey.replace(/-/g, "_");

//       if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(formattedKey)) {
//         attrs.push(`${formattedKey}=${JSON.stringify(value)}`);
//       } else {
//         attrs.push(`**{${JSON.stringify(key)}: ${JSON.stringify(value)}}`);
//       }
//     }

//     const spc = " ".repeat(lvl * indent);
//     const onlychild =
//       !cts.length || (cts.length === 1 && cts[0].type === "text");
//     const j = onlychild ? ", " : `,\n${spc}`;
//     const inner = [...cs, ...attrs].filter(Boolean).join(j);

//     if (onlychild) return `${tagName}(${inner})`;
//     if (!attr1st || attrs.length === 0)
//       return `${tagName}(\n${spc}${inner}\n${" ".repeat((lvl - 1) * indent)})`;

//     const innerCs = cs.filter(Boolean).join(j);
//     const innerAttrs = attrs.join(", ");
//     return `${tagName}(${innerAttrs})(\n${spc}${innerCs}\n${" ".repeat(
//       (lvl - 1) * indent
//     )})`;
//   }

//   const $ = cheerio.load(html.trim(), { xml: { decodeEntities: true } });

//   // Remove comments
//   $("*")
//     .contents()
//     .filter(function () {
//       return this.type === "comment";
//     })
//     .remove();

//   return _parse($.root(), 1);
// }
