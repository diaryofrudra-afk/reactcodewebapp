export function EarningsPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-earnings">Earnings</div>;
}
