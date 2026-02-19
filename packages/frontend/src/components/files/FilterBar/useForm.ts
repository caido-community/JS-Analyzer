import type { AnalyzerKind, JsAnalyzerFilter } from "shared";
import { ALL_ANALYZER_KINDS } from "shared";
import { computed, onMounted, ref, watch } from "vue";

import { useConfigService } from "@/services/config";

export function useFilterBarForm() {
  const configService = useConfigService();
  const inScopeOnly = ref(true);
  const httpqlFilter = ref("");
  const selectedAnalyzers = ref<AnalyzerKind[]>([...ALL_ANALYZER_KINDS]);
  const configLoaded = ref(false);

  onMounted(() => {
    configService.load();
  });

  watch(
    () => configService.config.value,
    (cfg) => {
      if (cfg !== undefined && !configLoaded.value) {
        configLoaded.value = true;
        selectedAnalyzers.value = [...cfg.enabledAnalyzers];
        inScopeOnly.value = cfg.inScopeOnly;
      }
    },
    { immediate: true },
  );

  const filter = computed<JsAnalyzerFilter>(() => ({
    inScopeOnly: inScopeOnly.value,
    httpqlFilter:
      httpqlFilter.value.trim().length > 0
        ? httpqlFilter.value.trim()
        : undefined,
  }));

  return {
    inScopeOnly,
    httpqlFilter,
    selectedAnalyzers,
    filter,
  };
}
