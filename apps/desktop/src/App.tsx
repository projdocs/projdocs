import React from "react";
import { Pages } from "./pages";
import { RootLayout } from "./theme/root-layout";
import { Toolbar } from "./components/Toolbar";



export default function App() {
  return (
    <RootLayout>
      <Pages/>
      <Toolbar/>
    </RootLayout>
  );
}