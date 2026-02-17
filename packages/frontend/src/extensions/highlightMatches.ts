import { type Extension, StateEffect, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView } from "@codemirror/view";

const setHighlightEffect = StateEffect.define<
  { from: number; to: number } | undefined
>();

const highlightMark = Decoration.mark({
  class: "js-analyzer-highlight",
});

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlightEffect)) {
        if (effect.value === undefined) {
          return Decoration.none;
        }
        const { from, to } = effect.value;
        if (from >= 0 && to > from && to <= tr.state.doc.length) {
          return Decoration.set([highlightMark.range(from, to)]);
        }
        return Decoration.none;
      }
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const highlightTheme = EditorView.baseTheme({
  ".js-analyzer-highlight": {
    backgroundColor: "rgba(255, 200, 0, 0.3)",
    borderRadius: "2px",
  },
});

export const highlightMatchesExtension: Extension = [
  highlightField,
  highlightTheme,
];
