import { parse, HTMLElement, Node } from "node-html-parser";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const listAttributes = (el: HTMLElement): string[] =>
  Object.keys(el.attributes);

export function html2ft(html: string, attr1st: boolean = false): string {
  const revMap: { [key: string]: string } = { class: "cls", for: "fr" };

  function _parse(
    elm: any,
    lvl: number = 0,
    indent: number = 4
  ): string | null {
    if (typeof elm === "string") {
      return elm && elm.trim().length !== 0 ? JSON.stringify(elm.trim()) : null;
    }

    if (Array.isArray(elm)) {
      return elm
        .map((o) => _parse(o, lvl))
        .filter((el) => el)
        .join("\n");
    }

    if (!(elm instanceof Node)) {
      return null;
    }

    if (elm.nodeType === 8) {
      // 8 is the nodeType for comments
      return null;
    }

    if (elm.nodeType !== 1) {
      // element node
      return null;
    }

    const el = elm as HTMLElement;

    const tagName = el.tagName.toLowerCase().replace(/-/g, "_");

    const cts = elm.childNodes;
    const cs = cts
      .map((c) =>
        c.nodeType === 3 // text node
          ? c.textContent?.trim().length
            ? JSON.stringify(c.textContent?.trim())
            : null
          : _parse(c, lvl + 1)
      )
      .filter((c) => c);

    const attrs: string[] = [];
    const elmAttrs = listAttributes(el).sort((a, b) =>
      a === "class" ? 1 : b === "class" ? -1 : 0
    );

    for (const key of elmAttrs) {
      const value = el.getAttribute(key);

      if (typeof value === "undefined") {
        continue;
      }

      const mappedKey = revMap[key] || key;
      const formattedKey = mappedKey.replace(/-/g, "_");

      // clean up value by removing extra spaces and newlines
      const cleanedValue = value.trim().replace(/\s+/g, " ");

      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(formattedKey)) {
        attrs.push(
          `${formattedKey}=${JSON.stringify(cleanedValue).replaceAll('"', "'")}`
        );
      } else {
        attrs.push(
          `**{${JSON.stringify(key)}: ${JSON.stringify(cleanedValue).replaceAll(
            '"',
            "'"
          )}}`
        );
      }
    }

    const spc = " ".repeat(lvl * indent);
    const onlychild =
      !cts.length || (cts.length === 1 && cts[0].nodeType === 3); // text node (nodeType === 3)
    const j = onlychild ? ", " : `,\n${spc}`;
    const inner = [...cs, ...attrs].filter(Boolean).join(j);

    if (onlychild) {
      return `${capitalize(tagName)}(${inner})`;
    }

    if (!attr1st || attrs.length === 0) {
      return `${capitalize(tagName)}(\n${spc}${inner}\n${" ".repeat(
        (lvl - 1) * indent
      )})`;
    }

    const innerCs = cs.filter(Boolean).join(j);
    const innerAttrs = attrs.join(", ");

    return `${capitalize(
      tagName
    )}(${innerAttrs})(\n${spc}${innerCs}\n${" ".repeat((lvl - 1) * indent)})`;
  }

  // figure out what actual input should be
  // by default, send everything
  const dom = parse(html.trim());

  let input: any = dom.childNodes[0];

  if (html.match(/html/gi)) {
    input = dom.childNodes;
  } else if (html.match(/body/gi)) {
    input = [];

    const head = dom.childNodes.find((c) => c.rawTagName === "head");
    const body = dom.childNodes.find((c) => c.rawTagName === "body");

    if (head) {
      input.push(head);
    }

    input.push(body);
  }

  return _parse(input, 1) || "";
}
