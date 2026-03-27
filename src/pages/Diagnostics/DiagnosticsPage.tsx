export function DiagnosticsPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-diagnostics">Diagnostics</div>;
}
