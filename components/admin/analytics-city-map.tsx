"use client";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";

import type { CityRow } from "@/lib/analytics/report";

export function AnalyticsCityMap({ cities }: { cities: CityRow[] }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || !cities.length) return;
    let map: LeafletMap | undefined;
    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !container.current) return;
      map = L.map(container.current, {
        attributionControl: true,
        maxZoom: 14,
        minZoom: 2,
        scrollWheelZoom: true,
        worldCopyJump: true,
        zoomControl: true,
      });
      L.tileLayer(
        process.env.NEXT_PUBLIC_ANALYTICS_TILE_URL
          ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        },
      ).addTo(map);

      const max = Math.max(...cities.map((city) => city.sessions), 1);
      const points: Array<[number, number]> = [];
      for (const city of cities) {
        if (!Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) continue;
        points.push([city.latitude, city.longitude]);
        const marker = L.circleMarker([city.latitude, city.longitude], {
          color: "#704a3c",
          fillColor: "#b77370",
          fillOpacity: 0.72,
          radius: 7 + Math.sqrt(city.sessions / max) * 15,
          weight: 2,
        }).addTo(map);
        const location = [city.city, city.region, city.country_code].filter(Boolean).join(" · ");
        marker.bindTooltip(
          `<strong>${escapeHtml(location)}</strong><br>${city.sessions} ${city.sessions === 1 ? "sessão" : "sessões"}`,
          { direction: "top" },
        );
      }
      if (points.length === 1) map.setView(points[0], 10);
      else if (points.length) {
        map.fitBounds(L.latLngBounds(points), { padding: [28, 28] });
        if (map.getZoom() > 11) map.setZoom(11);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [cities]);

  if (!cities.length) {
    return (
      <div className="admin-map-empty">
        <span aria-hidden="true">◎</span>
        <p>O mapa aparecerá quando houver sessões com cidade identificada.</p>
      </div>
    );
  }

  return (
    <div
      aria-label="Mapa de sessões por cidade, sem precisão de bairro"
      className="admin-city-map"
      ref={container}
      role="img"
    />
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}
