<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import ConfirmDialog from "primevue/confirmdialog";
import DatePicker from "primevue/datepicker";

import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import Select from "primevue/select";

import { useToast } from "primevue/usetoast";
import { API } from "@/ApiRoute";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();

const report = ref<string>("");
const reportOptions = ref([
  { label: "Primeras Consultas", value: "initialConsultations" },
  { label: "Actividades", value: "activities" },
  { label: "Trabajo Social", value: "socialWork" },
]);
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);

const isReportSelected = computed(() => {
  return (
    report.value === "" && startDate.value === null && endDate.value === null
  );
});

const areDatesPicked = computed(() => {
  return startDate.value !== null && endDate.value !== null;
});

watch(
  () => report.value,
  (newValue) => {
    if (newValue) {
      startDate.value = null;
      endDate.value = null;
    }
  }
);

const downloadExcelConsultationReport = async () => {
  if (report.value === "") {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Seleccione un informe",
      life: 3000,
    });
    return;
  }

  if (startDate.value === null || endDate.value === null) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Seleccione las fechas",
      life: 3000,
    });
    return;
  }

  //We check if the start date is greater than the end date
  if (startDate.value > endDate.value) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "La fecha de inicio no puede ser mayor que la fecha de fin",
      life: 3000,
    });
    return;
  }



  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    // Ensure month and day are two digits
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = formatDate(startDate.value);
  const formattedEndDate = formatDate(endDate.value);

  axios.get(
    `${API}/initial-consultations/report/excel?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
    {
      responseType: "blob",
    }
  )
    .then((response) => {
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      console.log('Content-Disposition Header:', contentDisposition); // Log the header

      let filename = `${report.value || 'report'}.xlsx`; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        console.log('Filename Match Result:', filenameMatch); // Log the regex match result

        if (filenameMatch && filenameMatch.length > 1) {
          // --- TRIM THE TRAILING QUOTE ---
          filename = filenameMatch[1].replace(/"$/, ''); // Remove trailing quote if present
          // --- END OF CHANGE ---
          console.log('Extracted Filename:', filename); // Log the extracted filename
        } else {
          console.log('Filename could not be extracted from header.');
        }
      } else {
        console.log('Content-Disposition header not found. Using default filename.');
      }

      // --- PASS THE ACTUAL DATA TO THE BLOB ---
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      // --- END OF CHANGE ---

      console.log('Final filename being set:', filename); // Add log to confirm filename before setting
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Use the extracted or default filename
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the object URL
    })
    .catch((error) => {
      console.error('Error downloading report:', error); // Log the full error
      // Check if the error response has more details
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Error al descargar el informe",
        life: 3000,
      });
    });


};

const downloadExcelActivityReport = async () => {
  if (report.value === "") {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Seleccione un informe",
      life: 3000,
    });
    return;
  }

  if (startDate.value === null || endDate.value === null) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Seleccione las fechas",
      life: 3000,
    });
    return;
  }

  //We check if the start date is greater than the end date
  if (startDate.value > endDate.value) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "La fecha de inicio no puede ser mayor que la fecha de fin",
      life: 3000,
    });
    return;
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    // Ensure month and day are two digits
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = formatDate(startDate.value);
  const formattedEndDate = formatDate(endDate.value);

  axios.get(
    `${API}/activity/report/excel?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
    {
      responseType: "blob",
    }
  )
    .then((response) => {
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      console.log('Content-Disposition Header:', contentDisposition); // Log the header

      let filename = `${report.value || 'report'}.xlsx`; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        console.log('Filename Match Result:', filenameMatch); // Log the regex match result

        if (filenameMatch && filenameMatch.length > 1) {
          // --- TRIM THE TRAILING QUOTE ---
          filename = filenameMatch[1].replace(/"$/, ''); // Remove trailing quote if present
          // --- END OF CHANGE ---
          console.log('Extracted Filename:', filename); // Log the extracted filename
        } else {
          console.log('Filename could not be extracted from header.');
        }
      } else {
        console.log('Content-Disposition header not found. Using default filename.');
      }

      // --- PASS THE ACTUAL DATA TO THE BLOB
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      // --- END OF CHANGE ---


      console.log('Final filename being set:', filename); // Add log to confirm filename before setting
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Use the extracted or default filename
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the object URL

    })
    .catch((error) => {
      console.error('Error downloading report:', error); // Log the full error
      // Check if the error response has more details
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Error al descargar el informe",
        life: 3000,
      });
    });
};

const downloadExcelSWReport = async () => {
  if (report.value === "") {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Seleccione un informe",
      life: 3000,
    });
    return;
  }

  if (startDate.value === null || endDate.value === null) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "Seleccione las fechas",
      life: 3000,
    });
    return;
  }

  //We check if the start date is greater than the end date
  if (startDate.value > endDate.value) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "La fecha de inicio no puede ser mayor que la fecha de fin",
      life: 3000,
    });
    return;
  }
  //We check if the start date is less than the end date
  if (startDate.value < endDate.value) {
    toast.add({
      severity: "warn",
      summary: "Advertencia",
      detail: "La fecha de inicio no puede ser menor que la fecha de fin",
      life: 3000,
    });
    return;
  }

  

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    // Ensure month and day are two digits
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = formatDate(startDate.value);
  const formattedEndDate = formatDate(endDate.value);

  axios.get(
    `${API}/social-work/report/excel?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
    {
      responseType: "blob",
    }
  )
    .then((response) => {
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      console.log('Content-Disposition Header:', contentDisposition); // Log the header
      


      let filename = `${report.value || 'report'}.xlsx`; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        console.log('Filename Match Result:', filenameMatch); // Log the regex match result

        if (filenameMatch && filenameMatch.length > 1) {
          // --- TRIM THE TRAILING QUOTE ---
          filename = filenameMatch[1].replace(/"$/, ''); // Remove trailing quote if present
          // --- END OF CHANGE ---
          console.log('Extracted Filename:', filename); // Log the extracted filename
        } else {
          console.log('Filename could not be extracted from header.');
        }
      } else {
        console.log('Content-Disposition header not found. Using default filename.');
      }

      // --- PASS THE ACTUAL DATA TO THE BLOB
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      // --- END OF CHANGE ---


      console.log('Final filename being set:', filename); // Add log to confirm filename before setting

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Use the extracted or default filename
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the object URL

    })
    .catch((error) => {
      console.error('Error downloading report:', error); // Log the full error
      // Check if the error response has more details
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Error al descargar el informe",
        life: 3000,
      });
    });
};

const confirm = useConfirm();
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <div class="card ml-20 mr-30 mt-20 mb-5">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold mb-4">📋 Informe de Excel</h1>
    </div>

    <div class="flex flex-content gap-8 mt-3 mb-40">
      <div class="ml-9 mr-28 w-full max-w-70">
        <Select
          v-model="report"
          :options="reportOptions"
          v-tooltip="'Selecciona'"
          size="large"
          option-label="label"
          option-value="value"
          placeholder="Seleccione el informe"
          class="w-full max-w-70"
        />
      </div>

      <FloatLabel variant="on">
        <DatePicker
          v-model="startDate"
          inputId="on_label"
          showIcon
          size="large"
          :disabled="isReportSelected"
        />
        <label for="on_label">Fecha de inicio</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <DatePicker
          v-model="endDate"
          inputId="on_label"
          showIcon
          size="large"
        :disabled="isReportSelected"
        />
        <label for="on_label">Fecha fin</label>
      </FloatLabel>
    </div>
    <div class="flex justify-center -mt-20 mr-8">
      <div v-if="report === 'initialConsultations'">
        <Button
        @click="downloadExcelConsultationReport"
        label="Descargar Excel"
        icon="pi pi-download"
        severity="contrast"
        raised
        :disabled="isReportSelected || !areDatesPicked"
      />
      </div>
      <div v-if="report === 'activities'">
        <Button
        @click="downloadExcelActivityReport"
        label="Descargar Excel"
        icon="pi pi-download"
        severity="contrast"
        raised
        :disabled="isReportSelected || !areDatesPicked"
      />
      </div>
      <div v-if="report === 'socialWork'">
        <Button
        @click="downloadExcelSWReport"
        label="Descargar Excel"
        icon="pi pi-download"
        severity="contrast"
        raised
        :disabled="isReportSelected || !areDatesPicked"
      />
      </div>

    </div>
  </div>
</template>

<style scoped>
</style>
