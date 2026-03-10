import type { InternalEventMap, InternalEventName } from "./types";

type Listener<K extends InternalEventName> = (
  data: InternalEventMap[K],
) => void;

type AnyListener = (data: never) => void;

const listeners = new Map<InternalEventName, AnyListener[]>();

export function on<K extends InternalEventName>(
  event: K,
  listener: Listener<K>,
): void {
  const list = listeners.get(event) ?? [];
  list.push(listener as AnyListener);
  listeners.set(event, list);
}

export function off<K extends InternalEventName>(
  event: K,
  listener: Listener<K>,
): void {
  const list = listeners.get(event);
  if (list === undefined) return;
  const index = list.indexOf(listener as AnyListener);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

export function emit<K extends InternalEventName>(
  event: K,
  data: InternalEventMap[K],
): void {
  const list = listeners.get(event);
  if (list === undefined) return;
  for (const listener of list) {
    (listener as Listener<K>)(data);
  }
}

export function reset(): void {
  listeners.clear();
}
