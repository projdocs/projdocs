import PageBody from "./client-side";



export default function() {
  return (
    <PageBody
      apiBase={process.env.PROJDOCS_API_URL}
    />
  );
}