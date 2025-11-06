import React from "react";
import LogisticsGallery from "./components/LogisticsGallery";

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Digvijay Express — Media & Manifests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search cargo images, filter by transport mode, save favourites and inspect details. Images: picsum.photos / Data: JSONPlaceholder
          </p>
        </header>

        <LogisticsGallery />
      </div>
    </div>
  );
}
