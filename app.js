"use strict";

// Names are presentation only. Credentials are read locally; opening the app
// requires the visitor to activate the link. No request or automatic redirect.
const params = new URLSearchParams(window.location.search);
const entries = [...params.entries()];
const token = params.get("id");
const payload = params.get("data");
const name = params.get("name");
const invitation = params.get("invite");
const invitationContext = params.has("invite");
const cleanLocation = !/[\u0000-\u001f\u007f]/.test(window.location.search) &&
  !window.location.hash && !(typeof window.location.href === "string" && window.location.href.includes("#"));
const validName = name === null ||
  (name.length > 0 && name.length <= 80 && !/[\u0000-\u001f\u007f]/.test(name) && name.trim() === name);
const validKeys = entries.length >= 1 && entries.length <= 2 &&
  entries.every(([key]) => key === "id" || key === "data" || key === "name") &&
  entries.filter(([key]) => key === "name").length <= 1;
const tokenLink = token?.length === 32 && /^[0-9a-f]{32}$/.test(token) && payload === null &&
  entries.filter(([key]) => key === "id").length === 1;
const directLink = /^[A-Za-z0-9_-]{1,16384}$/.test(payload || "") && payload?.length > 0 &&
  !/[\u0000-\u001f\u007f]/.test(payload) && token === null &&
  entries.filter(([key]) => key === "data").length === 1 && window.location.search.length <= 16384;
const invitationLink = invitation?.length === 32 && /^[0-9a-f]{32}$/.test(invitation) &&
  entries.length === 1 && window.location.search === `?invite=${invitation}`;
const message = document.getElementById("message");
const openApp = document.getElementById("open-app");
const heading = document.getElementById("route-heading");
const note = document.querySelector?.(".note");

if (note) {
  note.id = "link-help";
  openApp.setAttribute("aria-describedby", "message link-help");
}

if (invitationContext) {
  heading.textContent = "Invitation au convoi";
  document.title = "Invitation au convoi · Driver Society Navigation";
  message.textContent = "Ouvrez Driver Society Navigation pour rejoindre le convoi de l’organisateur.";
  if (note) note.textContent = "Une connexion à votre compte Driver Society est nécessaire. L’invitation sera vérifiée dans l’application ; elle peut expirer ou être révoquée.";
}

if (cleanLocation && (invitationLink || (validKeys && validName && (tokenLink || directLink)))) {
  if (invitationLink) {
    openApp.href = `driversociety-reprise://event?invite=${invitation}`;
    openApp.textContent = "Rejoindre dans l’application";
    openApp.setAttribute?.("aria-label", "Ouvrir Driver Society Navigation pour rejoindre ce convoi");
  } else {
    openApp.href = tokenLink
      ? `driversociety-reprise://route?id=${token}`
      : `driversociety-reprise://route?data=${payload}`;
    openApp.textContent = "Ouvrir l’itinéraire";
    openApp.setAttribute?.("aria-label", "Ouvrir cet itinéraire dans Driver Society Navigation");
    if (name) {
      heading.textContent = `Trajet vers ${name}`;
      document.title = `Trajet vers ${name} · Driver Society`;
    }
  }
  openApp.hidden = false;
} else {
  message.textContent = invitationContext
    ? "Ce lien d’invitation est invalide. Demandez un nouveau lien à l’organisateur."
    : "Ce lien d’itinéraire est invalide. Demandez un nouveau lien à son créateur.";
  message.classList.add("error");
  message.setAttribute?.("role", "alert");
}
