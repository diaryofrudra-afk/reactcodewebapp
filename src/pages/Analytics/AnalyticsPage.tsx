export function AnalyticsPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-analytics">Analytics</div>;
}
