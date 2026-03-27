export function OperatorsPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-operators">Operators</div>;
}
