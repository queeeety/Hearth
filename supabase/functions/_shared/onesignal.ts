export async function sendPush(
  restKey: string,
  appId: string,
  flatmateId: string,
  message: string,
): Promise<void> {
  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${restKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      filters: [{ field: 'tag', key: 'flatmate_id', value: flatmateId }],
      contents: { en: message },
    }),
  })
}
