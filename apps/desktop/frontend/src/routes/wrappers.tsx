import { Outlet } from "react-router-dom";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { useNavigate } from "react-router";



export const HasProjDocsHost = () => {

  const navigate = useNavigate();
  const host = window.localStorage.getItem(StorageKeys.ProjDocs.Host.Web);
  if (!host) {
    return navigate("/");
  }

  return (
    <Outlet />
  );
};