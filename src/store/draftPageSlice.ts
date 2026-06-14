import { createSlice, type PayloadAction, nanoid } from "@reduxjs/toolkit";
import type { Page, Section, SectionType } from "@/lib/schema";

interface DraftState {
  page: Page | null;
}
const initialState: DraftState = { page: null };

const defaultProps: Record<SectionType, Record<string, unknown>> = {
  hero: { heading: "New heading", subheading: "" },
  cta: { label: "Get started", url: "https://example.com", heading: "Join us now!" },
  featureGrid: { features: [{ title: "Feature", body: "Body" }] },
  testimonial: { quote: "Great product", author: "Anon" },
};

const draftPageSlice = createSlice({
  name: "draftPage",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<Page>) {
      state.page = action.payload;
    },
    addSection(state, action: PayloadAction<SectionType>) {
      if (!state.page) return;
      const type = action.payload;
      state.page.sections.push({
        id: nanoid(),
        type,
        props: defaultProps[type],
      } as Section);
    },
    removeSection(state, action: PayloadAction<string>) {
      if (!state.page) return;
      state.page.sections = state.page.sections.filter(
        (s) => s.id !== action.payload
      );
    },
    reorderSection(state, action: PayloadAction<{ from: number; to: number }>) {
      if (!state.page) return;
      const { from, to } = action.payload;
      const list = state.page.sections;
      if (to < 0 || to >= list.length) return;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
    },
    updateSectionProps(
      state,
      action: PayloadAction<{ id: string; props: Record<string, unknown> }>
    ) {
      if (!state.page) return;
      const section = state.page.sections.find((s) => s.id === action.payload.id);
      if (section) {
        section.props = { ...section.props, ...action.payload.props };
      }
    },
  },
});

export const {
  setPage,
  addSection,
  removeSection,
  reorderSection,
  updateSectionProps,
} = draftPageSlice.actions;
export default draftPageSlice.reducer;