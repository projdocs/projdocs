import { useParams } from "react-router-dom";
import { JSX } from "react";



export default function OrganizationsLanding(): JSX.Element {
  const { organizationID } = useParams<{ organizationID: string }>();

  console.log(organizationID);

  return (
    <></>
  );
}