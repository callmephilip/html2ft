import { parse, HTMLElement, Node } from "node-html-parser";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const listAttributes = (el: HTMLElement): string[] =>
  Object.keys(el.attributes);

const wrapSvg = (svg: string): string => `NotStr("""${svg}""")`;

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

    // XX: a bit of a shortcut here for SVGs
    if (tagName === "svg") {
      return wrapSvg(el.toString());
    }

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

    const kws: { [key: string]: string } = {};

    for (const key of elmAttrs) {
      let value = el.getAttribute(key);

      if (typeof value === "undefined") {
        continue;
      }

      const mappedKey = revMap[key] || key;
      const formattedKey = mappedKey.replace(/-/g, "_");

      // clean up value by removing extra spaces and newlines
      const cleanedValue = value.trim().replace(/\s+/g, " ");

      const serializeValue = (v: string) => {
        if (v === "True" || v === "False") {
          return v;
        }
        return JSON.stringify(cleanedValue).replaceAll('"', "'");
      };

      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(formattedKey)) {
        // "standard" looking attributes just get pushed in as key=value
        attrs.push(`${formattedKey}=${serializeValue(cleanedValue)}`);
      } else {
        // for anything wild looking (i.e. "x-transition.opacity.duration.600ms"), let's get them all together in a dictionary
        // and then include them via **{...} python dictionary spread
        kws[key] = serializeValue(cleanedValue !== "" ? cleanedValue : "True");
      }
    }

    if (Object.keys(kws).length) {
      // got kws? throw them in to attrs all in one go
      attrs.push(
        `**{${Object.keys(kws)
          .reduce(
            (acc, key) =>
              acc +
              `, ${JSON.stringify(key).replaceAll('"', "'")}: ${kws[key]}`,
            ""
          )
          .replace(/^,\s/, "")}}`
      );
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

  let input: any = dom.childNodes;

  if (
    dom.childNodes.find((c) => ["head", "body"].indexOf(c.rawTagName) !== -1)
  ) {
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
