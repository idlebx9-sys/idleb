/* IDLEB STORE - central order sync + Telegram notifications */
(function () {
  "use strict";
  var KEY = "idleb_orders";
  var originalSet = localStorage.setItem.bind(localStorage);
  var originalGet = localStorage.getItem.bind(localStorage);
  var syncing = false;

  function parse(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  async function pushOrders(value) {
    if (syncing) return;
    var orders = parse(value);
    if (!Array.isArray(orders)) return;
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orders: orders })
      });
    } catch (e) {
      console.warn("Order sync unavailable:", e);
    }
  }

  localStorage.setItem = function (key, value) {
    originalSet(key, value);
    if (key === KEY) pushOrders(value);
  };

  async function pullOrders() {
    try {
      var r = await fetch("/api/orders", { cache: "no-store" });
      if (!r.ok) return;
      var data = await r.json();
      if (!Array.isArray(data.orders)) return;
      syncing = true;
      originalSet(KEY, JSON.stringify(data.orders));
      syncing = false;
      window.dispatchEvent(new StorageEvent("storage", {
        key: KEY,
        newValue: JSON.stringify(data.orders)
      }));
    } catch (e) {
      syncing = false;
      console.warn("Order pull unavailable:", e);
    }
  }

  pullOrders();
  setInterval(pullOrders, 15000);
})();
