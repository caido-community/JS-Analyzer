import type { StaticAssetEntry } from "shared";
import { computed, ref } from "vue";

export type FileGroup = {
  host: string;
  files: { path: string; index: number }[];
};

export function useFileList(assets: () => StaticAssetEntry[]) {
  const searchQuery = ref("");
  const expandedHosts = ref<Record<string, boolean>>({});

  function isExpanded(host: string): boolean {
    return expandedHosts.value[host] !== false;
  }

  function toggleHost(host: string) {
    expandedHosts.value = {
      ...expandedHosts.value,
      [host]: !isExpanded(host),
    };
  }

  const groups = computed<FileGroup[]>(() => {
    const q = searchQuery.value.toLowerCase().trim();
    const list = assets();

    const hostMap = new Map<string, { path: string; index: number }[]>();
    for (let i = 0; i < list.length; i++) {
      const asset = list[i]!;
      if (
        q.length > 0 &&
        !asset.url.toLowerCase().includes(q) &&
        !asset.host.toLowerCase().includes(q) &&
        !asset.path.toLowerCase().includes(q)
      ) {
        continue;
      }
      const existing = hostMap.get(asset.host) ?? [];
      existing.push({ path: asset.path, index: i });
      hostMap.set(asset.host, existing);
    }

    const result: FileGroup[] = [];
    for (const [host, files] of hostMap) {
      result.push({ host, files });
    }
    return result;
  });

  const totalFileCount = computed(() => {
    let count = 0;
    for (const group of groups.value) {
      count += group.files.length;
    }
    return count;
  });

  return {
    searchQuery,
    groups,
    totalFileCount,
    expandedHosts,
    isExpanded,
    toggleHost,
  };
}
