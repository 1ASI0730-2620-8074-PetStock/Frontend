import { ref } from 'vue';
import { AnalyticsApi } from '../infrastructure/analytics-api.js';
import { ReportAssembler } from '../infrastructure/report.assembler.js';

const report = ref(null);
const loading = ref(false);
const error = ref(null);

export function useAnalyticsStore() {
    async function loadDashboard() {
        loading.value = true;
        error.value = null;

        try {
            const data = await AnalyticsApi.getDashboardData();

            report.value = ReportAssembler.toEntityFromResource(data);
        } catch (e) {
            console.error('Error loading Analytics:', e);
            error.value = 'No se pudo cargar la información de reportes.';
        } finally {
            loading.value = false;
        }
    }

    async function registerReport() {

        const currentUser =
            JSON.parse(
                sessionStorage.getItem(
                    'currentUser'
                )
            )

        if (!currentUser) {
            console.warn(
                'No existe currentUser en sessionStorage.'
            )
            return
        }

        try {

            await AnalyticsApi.createReport({

                userId:
                    Number(
                        currentUser.id
                    ),

                reportType:
                    'Weekly Sales',

                fileFormat:
                    'PDF'

            })

        } catch (e) {

            console.error(
                'Error registering the report:', e
            )
        }
    }

    return {
        report,
        loading,
        error,
        loadDashboard,
        registerReport
    }
}