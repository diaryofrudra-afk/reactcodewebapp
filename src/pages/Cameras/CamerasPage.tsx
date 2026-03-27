export function CamerasPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-cameras">Cameras</div>;
}
