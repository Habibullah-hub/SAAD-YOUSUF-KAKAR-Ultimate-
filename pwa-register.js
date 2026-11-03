/* SK Cyber Hub PWA registration and safe app-shell update notice. */
(() => {
  if (!("serviceWorker" in navigator)) return;
  let waitingWorker = null;
  let reloading = false;

  const showUpdateNotice = () => {
    if (document.getElementById("skPwaUpdateNotice")) return;
    const notice = document.createElement("aside");
    notice.id = "skPwaUpdateNotice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;max-width:620px;margin:auto;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #398d73;border-radius:14px;background:#0d211d;color:#f3fff9;box-shadow:0 12px 36px #0008;font:600 13px/1.45 system-ui,sans-serif";
    const message = document.createElement("span");
    message.textContent = "SK Cyber Hub کا نیا ورژن تیار ہے۔ اپڈیٹ کے لیے دبائیں۔";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Update";
    button.style.cssText = "flex:none;padding:9px 13px;border:1px solid #53e0c1;border-radius:9px;background:#53e0c1;color:#092018;font-weight:800";
    button.addEventListener("click", () => {
      if (!waitingWorker) return;
      button.disabled = true;
      waitingWorker.postMessage({ type: "SK_SKIP_WAITING" });
    });
    notice.append(message, button);
    document.body.appendChild(notice);
  };

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "./",
        updateViaCache: "none"
      });
      if (registration.waiting && navigator.serviceWorker.controller) {
        waitingWorker = registration.waiting;
        showUpdateNotice();
      }
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            waitingWorker = worker;
            showUpdateNotice();
          }
        });
      });
      registration.update().catch(() => {});
    } catch (error) {
      console.warn("SK Cyber Hub PWA registration unavailable:", error);
    }
  });
})();
