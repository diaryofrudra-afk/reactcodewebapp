export function AssetsPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-assets">Assets</div>;
}
