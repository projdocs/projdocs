import { useNavigate } from "react-router";
import { H2 } from "@packages/ui/components/typography";
import { Button } from "@packages/ui/components/button";



export const NotFound = () => {

  const navigate = useNavigate();

  return (
    <div className={"w-full h-full flex flex-col items-center justify-center"}>
      <H2>{"Uh, oh..."}</H2>
      <p>{"The route you requested was not found."}</p>
      <Button className={"mt-4 w-20"} variant={"secondary"} onClick={() => navigate(-1)}>{"Back"}</Button>
    </div>
  );
};