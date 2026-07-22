import StatusPage from '../components/StatusPage';

export default function ServerError() {
  return (
    <StatusPage
      code="500"
      title="Something went wrong"
      message="An unexpected error occurred on our end. Please try again in a moment."
    />
  );
}
