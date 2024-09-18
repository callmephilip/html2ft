export const indent = (str: string, spaces: number) => {
  const space = " ".repeat(spaces);
  return str
    .split("\n")
    .map((line, i) => (i !== 0 ? `${space}${line}` : line))
    .join("\n");
};
