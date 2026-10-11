"use strict";

// The optional name is presentation only; the route itself comes from id/data.
const params = new URLSearchParams(window.location.search);
const entries = [...params.entries()];
const token = params.get("id");
const payload = params.get("data");
const name = params.get("name");
const validName = name === null ||
  (name.length > 0 && name.length <= 80 && !/[\u0000-\u001f\u007f]/.test(name) && name.trim() === name);
const validKeys = entries.length >= 1 && entries.length <= 2 &&
  entries.every(([key]) => key === "id" || key === "data" || key === "name") &&
  entries.filter(([key]) => key === "name").length <= 1;
const tokenLink = /^[0-9a-f]{32}$/.test(token || "") && payload === null &&
  entries.filter(([key]) => key === "id").length === 1;
const directLink = /^[A-Za-z0-9_-]{1,16384}$/.test(payload || "") && token === null &&
  entries.filter(([key]) => key === "data").length === 1 && window.location.search.length <= 16384;
const message = document.getElementById("message");
const openApp = document.getElementById("open-app");
const heading = document.getElementById("route-heading");

if (validKeys && validName && (tokenLink || directLink) && !window.location.hash) {
  openApp.href = tokenLink
    ? `driversociety-reprise://route?id=${token}`
    : `driversociety-reprise://route?data=${payload}`;
  openApp.hidden = false;
  if (name) {
    heading.textContent = `Trajet vers ${name}`;
    document.title = `Trajet vers ${name} · Driver Society`;
  }
} else {
  message.textContent = "Ce lien d’itinéraire est invalide. Demandez un nouveau lien à son créateur.";
  message.classList.add("error");
}
