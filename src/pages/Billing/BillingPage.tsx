export function BillingPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-billing">Billing</div>;
}
