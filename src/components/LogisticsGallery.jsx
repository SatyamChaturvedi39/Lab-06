import React, { useEffect, useState } from "react";
import axios from "axios";

const MODES = [
  { id: "all", label: "All" },
  { id: "rail", label: "Rail" },
  { id: "air", label: "Air" },
  { id: "sea", label: "Sea" },
];

function modeQuery(mode) {
  if (mode === "rail") return "freight train OR rail freight OR goods train";
  if (mode === "air") return "cargo plane OR air freight OR cargo aircraft";
  if (mode === "sea") return "shipping container OR cargo ship OR freighter";
  return "";
}

export default function LogisticsGallery() {
  const [mode, setMode] = useState("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line
  }, []);

  async function fetchImages(search = q, m = mode) {
    setLoading(true);
    setError("");
    setItems([]);
    try {
      const base = "https://en.wikipedia.org/w/api.php";
      const composed = [search, modeQuery(m)].filter(Boolean).join(" ");
      const params = {
        action: "query",
        generator: "search",
        gsrsearch: composed || "cargo freight",
        gsrlimit: 12,
        prop: "pageimages|extracts",
        piprop: "thumbnail",
        pithumbsize: 600,
        exintro: 1,
        explaintext: 1,
        exchars: 220,
        format: "json",
        origin: "*",
      };
      const res = await axios.get(base, { params });
      const pages = res.data.query && res.data.query.pages ? res.data.query.pages : null;
      if (!pages) {
        setItems([]);
        setError("No results found.");
        setLoading(false);
        return;
      }
      const arr = Object.values(pages)
        .map((p) => ({
          id: p.pageid,
          title: p.title,
          thumb: p.thumbnail ? p.thumbnail.source : null,
          extract: p.extract || "",
        }))
        .filter((i) => i.thumb);
      setItems(arr);
    } catch (err) {
      console.error("fetchImages error:", err);
      setError("Failed to fetch. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function openModal(item) {
    setModal({ loading: true });
    try {
      const base = "https://en.wikipedia.org/w/api.php";
      const params = {
        action: "query",
        pageids: item.id,
        prop: "pageimages|extracts",
        piprop: "thumbnail",
        pithumbsize: 1200,
        exlimit: 1,
        explaintext: 1,
        exchars: 2000,
        format: "json",
        origin: "*",
      };
      const res = await axios.get(base, { params });
      const page = res.data.query && res.data.query.pages ? Object.values(res.data.query.pages)[0] : null;
      const thumbLarge = page && page.thumbnail ? page.thumbnail.source : item.thumb;
      const extractLong = page && page.extract ? page.extract : item.extract;
      setModal({ id: item.id, title: item.title, thumbLarge, extractLong });
    } catch (err) {
      console.error("openModal error:", err);
      setModal({ id: item.id, title: item.title, thumbLarge: item.thumb, extractLong: item.extract });
    }
  }

  return (
    <section className="bg-slate-100 rounded-lg shadow-sm p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchImages();
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search shipments / cargo topics..."
          className="w-full sm:flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full sm:w-48 border rounded px-3 py-2"
        >
          {MODES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2 w-full sm:w-auto">
          <button type="submit" className="flex-1 sm:flex-none bg-cyan-700 text-white px-4 py-2 rounded">
            Search
          </button>
          <button
            type="button"
            onClick={() => { setQ(""); setMode("all"); fetchImages("", "all"); }}
            className="bg-red-800 flex-1 sm:flex-none border px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-3 text-sm text-slate-500">{loading ? "Loading…" : error || `Results: ${items.length}`}</div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <article key={it.id} className="bg-slate-50 rounded overflow-hidden border">
            <div className="relative">
              <img
                src={it.thumb}
                alt={it.title}
                className="w-full h-44 object-cover cursor-pointer"
                onClick={() => openModal(it)}
              />
              <div className="absolute left-2 bottom-2 bg-white/80 px-2 py-1 text-xs rounded">Info</div>
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold line-clamp-2">{it.title}</div>
              <div className="text-xs text-slate-500 mt-2">{it.extract}</div>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && !loading && <div className="mt-6 text-sm text-slate-500">No results found.</div>}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl overflow-auto max-h-[90vh]">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img src={modal.thumbLarge} alt={modal.title} className="w-full h-72 md:h-full object-cover" />
              </div>
              <div className="p-4 md:w-1/2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{modal.title}</h3>
                  <button onClick={() => setModal(null)} className="px-3 py-1 rounded bg-red-600">Close</button>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{modal.extractLong}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}