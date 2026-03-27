export function FuelPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-fuel">Fuel</div>;
}
