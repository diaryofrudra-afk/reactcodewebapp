export function LoggerPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-logger">Logger</div>;
}
