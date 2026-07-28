"use client";

import { openCookieSettings } from "@/lib/analytics/consent";

export function CookieSettingsButton() {
  return (
    <button className="cookie-settings-button" type="button" onClick={openCookieSettings}>
      Preferências de cookies
    </button>
  );
}
