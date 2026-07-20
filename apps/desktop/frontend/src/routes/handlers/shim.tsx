import { FC } from "react";
import { useLoaderData } from "react-router-dom";



export function Shim(T: FC<any>): FC {
  return function() {
    const props = useLoaderData()
    return (
      <T {...props} />
    )
  }
}