/* SK Cyber Hub install, share-for-review and safe PWA updates. */
(() => {
  let deferredInstallPrompt = null;
  let waitingWorker = null;
  let reloading = false;

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const addAppActions = () => {
    if (document.getElementById("skAppActions") || isStandalone()) return;
    const panel = document.createElement("div");
    panel.id = "skAppActions";
    panel.setAttribute("aria-label", "SK Cyber Hub app actions");
    panel.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:99990;display:flex;gap:8px;align-items:center;padding:8px;border:1px solid #c7d8e8;border-radius:14px;background:#fff;color:#17212b;box-shadow:0 8px 28px #0002;font:600 12px/1.3 system-ui,sans-serif";
    const install = document.createElement("button");
    install.type = "button";
    install.id = "skInstallApp";
    install.textContent = "Install App";
    install.setAttribute("aria-label", "Install SK Cyber Hub app");
    install.style.cssText = "padding:10px 13px;border:0;border-radius:9px;background:#0067b8;color:#fff;font-weight:800;cursor:pointer";
    const share = document.createElement("button");
    share.type = "button";
    share.textContent = "Share for review";
    share.setAttribute("aria-label", "Share SK Cyber Hub with a friend for review");
    share.style.cssText = "padding:10px 11px;border:1px solid #b8c9d8;border-radius:9px;background:#f5f9fc;color:#17446b;font-weight:750;cursor:pointer";
    install.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try { await deferredInstallPrompt.userChoice; } catch (_) {}
        deferredInstallPrompt = null;
        install.textContent = "Install App";
        return;
      }
      window.alert("Android پر انسٹال کرنے کے لیے Chrome میں یہ صفحہ کھولیں، اوپر ⋮ مینو دبائیں، پھر 'Install app' یا 'Add to Home screen' منتخب کریں۔ اگر آپشن نظر نہ آئے تو صفحہ دوبارہ کھول کر کچھ دیر انتظار کریں۔");
    });
    share.addEventListener("click", async () => {
      const shareData = {
        title: "SK Cyber Hub — Review",
        text: "Please install and review SK Cyber Hub. Check its design, speed, navigation, buttons and features, then send me your honest feedback.",
        url: window.location.href
      };
      try {
        if (navigator.share) await navigator.share(shareData);
        else if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareData.text + " " + shareData.url);
          window.alert("Review link copied. You can now send it to your friend.");
        } else {
          window.prompt("Copy this review link:", shareData.url);
        }
      } catch (error) {
        if (error && error.name !== "AbortError") window.prompt("Copy this review link:", shareData.url);
      }
    });
    panel.append(install, share);
    document.body.appendChild(panel);
  };

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const button = document.getElementById("skInstallApp");
    if (button) button.textContent = "Install SK App";
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    const panel = document.getElementById("skAppActions");
    if (panel) panel.remove();
  });

  const showUpdateNotice = () => {
    if (document.getElementById("skPwaUpdateNotice")) return;
    const notice = document.createElement("aside");
    notice.id = "skPwaUpdateNotice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.style.cssText = "position:fixed;left:12px;right:12px;bottom:76px;z-index:99999;max-width:620px;margin:auto;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #398d73;border-radius:14px;background:#0d211d;color:#f3fff9;box-shadow:0 12px 36px #0008;font:600 13px/1.45 system-ui,sans-serif";
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

  document.addEventListener("DOMContentLoaded", addAppActions);
  if (document.readyState !== "loading") addAppActions();

  if (!("serviceWorker" in navigator)) return;
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
