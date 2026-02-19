<script setup lang="ts">
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Tag from "primevue/tag";
import type { ScanResult } from "shared";
import { onMounted, ref } from "vue";

import ScanResultDialogContainer from "@/components/ScanResultDialog/Container.vue";
import { useSDK } from "@/plugins/sdk";
import { useScannerRepository } from "@/repositories/scanner";

const sdk = useSDK();
const repo = useScannerRepository();
const results = ref<ScanResult[]>([]);
const loading = ref(false);

async function loadResults() {
  loading.value = true;
  const res = await repo.getScanResults();
  if (res.kind === "Ok") {
    results.value = res.value.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  }
  loading.value = false;
}

function asScan(row: unknown): ScanResult {
  return row as ScanResult;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function statusSeverity(
  status: string,
): "success" | "danger" | "warn" | "info" | "secondary" {
  switch (status) {
    case "Complete":
      return "success";
    case "Error":
      return "danger";
    case "Scanning":
      return "warn";
    default:
      return "secondary";
  }
}

function openScanResult(scanResult: ScanResult) {
  const dialog = sdk.window.showDialog(
    {
      component: ScanResultDialogContainer,
      props: { scanResult, sdk },
      events: { close: () => dialog.close() },
    },
    { title: "JS Analysis Results" },
  );
}

function handleRowClick(e: { data: unknown }) {
  openScanResult(asScan(e.data));
}

onMounted(() => {
  loadResults();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <div
      class="flex items-center justify-between px-2 py-1.5 border-b border-surface-700 shrink-0"
    >
      <span class="text-xs text-surface-300 font-medium">Scan History</span>
      <Button
        icon="fas fa-redo"
        text
        size="small"
        severity="secondary"
        class="!w-6 !h-6"
        @click="loadResults"
      />
    </div>

    <div class="flex-1 min-h-0">
      <DataTable
        :value="results"
        :loading="loading"
        scrollable
        scroll-height="flex"
        striped-rows
        class="text-xs"
        @row-click="handleRowClick"
      >
        <Column header="Date" style="width: 180px" class="!py-1 !px-2">
          <template #body="slotProps">
            <span class="text-[11px] text-surface-300">{{
              formatDate(asScan(slotProps.data).startedAt)
            }}</span>
          </template>
        </Column>
        <Column header="Files" style="width: 70px" class="!py-1 !px-2">
          <template #body="slotProps">
            <span class="text-[11px] text-surface-400">{{
              asScan(slotProps.data).totalFiles
            }}</span>
          </template>
        </Column>
        <Column header="Matches" style="width: 80px" class="!py-1 !px-2">
          <template #body="slotProps">
            <span class="text-[11px] text-surface-400">{{
              asScan(slotProps.data).totalMatches
            }}</span>
          </template>
        </Column>
        <Column header="Analyzers" class="!py-1 !px-2">
          <template #body="slotProps">
            <span class="text-[10px] text-surface-500 truncate">{{
              asScan(slotProps.data).analyzers.join(", ")
            }}</span>
          </template>
        </Column>
        <Column header="Status" style="width: 100px" class="!py-1 !px-2">
          <template #body="slotProps">
            <Tag
              :value="asScan(slotProps.data).status"
              :severity="statusSeverity(asScan(slotProps.data).status)"
              class="text-[10px] !py-0 !px-1.5"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
