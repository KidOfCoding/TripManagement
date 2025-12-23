// import { useEffect, useState } from "react";
// import Login from "../components/Login";
// import Signup from "../components/SignUp";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const user = { name: "User" };

  return <Dashboard user={user} onLogout={() => { }} />;
}
