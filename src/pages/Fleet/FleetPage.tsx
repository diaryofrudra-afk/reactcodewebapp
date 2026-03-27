export function FleetPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-fleet">Fleet</div>;
}
