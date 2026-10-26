export interface AppSettings {
  demoMode: boolean;
  gatewayBaseUrl: string;
  defaultCohort: string;
  workflowRefreshIntervalSec: number;
  themePreference: 'light' | 'dark' | 'system';
  autoSimulateKafkaLag: boolean;
}
