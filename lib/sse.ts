type Callback = (data: string) => void;
const subscribers = new Map<string, Set<Callback>>();

export function subscribe(channelId: string, cb: Callback): () => void {
  if (!subscribers.has(channelId)) subscribers.set(channelId, new Set());
  subscribers.get(channelId)!.add(cb);
  return () => subscribers.get(channelId)?.delete(cb);
}

export function notifyChannel(channelId: string, payload: unknown): void {
  const subs = subscribers.get(channelId);
  if (!subs?.size) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  subs.forEach(cb => cb(data));
}
