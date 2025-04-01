// src/layouts/MainLayout.jsx
import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="pt-20 px-4"> {/* Adjust pt-20 based on your Navbar height */}
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
