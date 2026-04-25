type Callback = (data: string) => void;

const channelSubscribers = new Map<string, Set<Callback>>();
const teamSubscribers = new Map<string, Set<Callback>>();

export function subscribe(channelId: string, cb: Callback): () => void {
  if (!channelSubscribers.has(channelId)) channelSubscribers.set(channelId, new Set());
  channelSubscribers.get(channelId)!.add(cb);
  return () => channelSubscribers.get(channelId)?.delete(cb);
}

export function notifyChannel(channelId: string, payload: unknown): void {
  const subs = channelSubscribers.get(channelId);
  if (!subs?.size) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  subs.forEach((cb) => cb(data));
}

export function subscribeTeam(teamId: string, cb: Callback): () => void {
  if (!teamSubscribers.has(teamId)) teamSubscribers.set(teamId, new Set());
  teamSubscribers.get(teamId)!.add(cb);
  return () => teamSubscribers.get(teamId)?.delete(cb);
}

export function notifyTeam(teamId: string, payload: unknown): void {
  const subs = teamSubscribers.get(teamId);
  if (!subs?.size) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  subs.forEach((cb) => cb(data));
}
