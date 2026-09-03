/* BONO Web Push Service Worker（#160 Web Push）
 *
 * 役割は Web Push の2イベントのみ。サイト全体のオフラインキャッシュには関与しない
 * （fetch ハンドラは意図的に持たない）。
 *
 * - push:             サーバーから届いたペイロードで通知を表示する
 * - notificationclick: 通知タップで対象URLを開く / 既存タブがあればフォーカスする
 *
 * プレーンJSで書く（ビルド対象外・public から静的配信）。
 */

self.addEventListener("push", (event) => {
  // ペイロードは web-push が JSON 文字列で送る想定。壊れていても通知は出す。
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "BONO";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 同一オリジンの既存タブがあればフォーカスして遷移させる
        for (const client of clientList) {
          try {
            const clientUrl = new URL(client.url);
            const target = new URL(targetUrl, self.location.origin);
            if (clientUrl.origin === target.origin && "focus" in client) {
              if ("navigate" in client && clientUrl.href !== target.href) {
                return client.navigate(target.href).then((c) => (c || client).focus());
              }
              return client.focus();
            }
          } catch (e) {
            // URL 解析失敗時は次の候補へ
          }
        }
        // 開いているタブが無ければ新規で開く
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
