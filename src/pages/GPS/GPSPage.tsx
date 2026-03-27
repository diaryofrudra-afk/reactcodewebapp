export function GPSPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-gps">GPS</div>;
}
