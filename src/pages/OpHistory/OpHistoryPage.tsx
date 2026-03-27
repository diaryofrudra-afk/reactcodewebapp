export function OpHistoryPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-op-history">Op History</div>;
}
