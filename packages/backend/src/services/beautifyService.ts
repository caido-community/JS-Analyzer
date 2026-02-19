import { js_beautify } from "js-beautify";

export function beautifyJs(content: string): string {
  return js_beautify(content, {
    indent_size: 2,
    indent_char: " ",
    max_preserve_newlines: 2,
    preserve_newlines: true,
    keep_array_indentation: false,
    break_chained_methods: false,
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: false,
    wrap_line_length: 0,
    e4x: false,
    comma_first: false,
    operator_position: "before-newline",
  });
}

export function isMinified(content: string): boolean {
  const lines = content.split("\n");
  if (lines.length === 0) return false;

  if (lines.length <= 3) {
    const avgLineLength = content.length / lines.length;
    return avgLineLength > 500;
  }

  const longLines = lines.filter((line) => line.length > 500).length;
  return longLines / lines.length > 0.5;
}
