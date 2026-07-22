import StatusPage from '../components/StatusPage';

export default function AccessDenied() {
  return (
    <StatusPage
      code="403"
      title="Access denied"
      message="You don't have permission to view this page. Please sign in with the correct account."
    />
  );
}
