import { JSDOM } from "jsdom";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function html2ft(html: string, attr1st: boolean = false): string {
  const revMap: { [key: string]: string } = { class: "cls", for: "fr" };

  const dom = new JSDOM(html.trim());

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

    if (!(elm instanceof dom.window.Element)) {
      return null;
    }

    if (elm.nodeType === 8) {
      // 8 is the nodeType for comments
      return null;
    }

    const tagName = elm.tagName.toLowerCase().replace(/-/g, "_");

    const cts = Array.from(elm.childNodes);
    const cs = cts
      .map((c) =>
        c instanceof dom.window.Text
          ? c.textContent?.trim().length
            ? JSON.stringify(c.textContent?.trim())
            : null
          : _parse(c, lvl + 1)
      )
      .filter((c) => c);

    const attrs: string[] = [];
    const elmAttrs = elm
      .getAttributeNames()
      // class goes last
      .sort((a, b) => (a === "class" ? 1 : b === "class" ? -1 : 0));

    for (const key of elmAttrs) {
      const value = elm.getAttribute(key);
      if (value === null) {
        continue;
      }

      const mappedKey = revMap[key] || key;
      const formattedKey = mappedKey.replace(/-/g, "_");

      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(formattedKey)) {
        attrs.push(
          `${formattedKey}=${JSON.stringify(value).replaceAll('"', "'")}`
        );
      } else {
        attrs.push(
          `**{${JSON.stringify(key)}: ${JSON.stringify(value).replaceAll(
            '"',
            "'"
          )}}`
        );
      }
    }

    const spc = " ".repeat(lvl * indent);
    const onlychild =
      !cts.length || (cts.length === 1 && cts[0] instanceof dom.window.Text);
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
  // jsdom will include all the standard html tags (html, head, body)
  // even if original HTML do not have them
  // our mission here is to clean things up

  // by default, send everything
  let input: any = Array.from(dom.window.document.body.childNodes);

  if (html.match(/html/gi)) {
    input = Array.from(dom.window.document.childNodes);
  } else if (html.match(/body/gi)) {
    input = [];

    if (dom.window.document.head) {
      input.push(dom.window.document.head);
    }

    input.push(dom.window.document.body);
  }

  return _parse(input, 1) || "";
}
