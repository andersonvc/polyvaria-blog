/*
  The floor's day, in New York time.

  The order of the stages and the fixed times are the platform's own:
  data is fetched after the close at 18:00, the day's plan is due by
  09:00, orders go out in thirteen waves from 09:45 to 15:30, and the
  closing auction takes what is left. How long each overnight stage
  takes varies; they are drawn here in sequence with even lengths.

  No DOM. The page uses it at build time to draw the clock and in the
  browser to say what the schedule has the floor doing now.
*/

export interface Stage {
  id: string;
  label: string;
  /** hours after midnight, New York; `to` may pass 24 */
  from: number;
  to: number;
  /** what the floor is doing during this stage */
  now: string;
}

export const STAGES: Stage[] = [
  {
    id: "reconcile",
    label: "Reconcile",
    from: 16,
    to: 18,
    now: "The market is closed. Today’s fills are being reconciled into the book.",
  },
  {
    id: "ingest",
    label: "Ingest",
    from: 18,
    to: 21.5,
    now: "Today’s data is landing, every row stamped with the moment it was learned.",
  },
  {
    id: "signals",
    label: "Signals",
    from: 21.5,
    to: 25,
    now: "The signal library is being recomputed across the whole universe.",
  },
  {
    id: "risk",
    label: "Risk",
    from: 1,
    to: 5,
    now: "The risk model is being re-estimated for the coming session.",
  },
  {
    id: "decide",
    label: "Decide",
    from: 5,
    to: 9.75,
    now: "The optimizer is solving for today’s book. The plan is due by nine.",
  },
  {
    id: "execute",
    label: "Execute",
    from: 9.75,
    to: 16,
    now: "",
  },
];

/** Thirteen wave times: 09:45, then every half hour from 10:00 to 15:30. */
export const WAVES: number[] = [9.75, ...Array.from({ length: 12 }, (_, i) => 10 + i * 0.5)];

export const CLOSING_AUCTION = 15 + 40 / 60;

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "last"];

export interface FloorState {
  /** id of the stage in progress, if any */
  stage: string | null;
  text: string;
}

/** `hours` is the New York time of day; `weekday` is 0 for Sunday. */
export function floorAt(hours: number, weekday: number): FloorState {
  if (weekday === 6 || weekday === 0) {
    return { stage: null, text: "The market is closed until Monday. Research is not." };
  }

  if (hours >= 9 && hours < 9.75) {
    return { stage: "decide", text: "Today’s plan is staged. The first orders go out at 9:45." };
  }

  if (hours >= 9.75 && hours < 16) {
    if (hours >= CLOSING_AUCTION) {
      return { stage: "execute", text: "The closing auction is taking the last orders of the day." };
    }
    const wave = WAVES.filter((t) => t <= hours).length;
    return { stage: "execute", text: `The ${ORDINALS[wave - 1]} of thirteen execution waves is working.` };
  }

  const stage = STAGES.find((s) => {
    const h = hours < s.from && s.to > 24 ? hours + 24 : hours;
    return h >= s.from && h < s.to;
  });
  return stage ? { stage: stage.id, text: stage.now } : { stage: null, text: "The floor is between stages." };
}

/** Time of day and weekday in New York for a given instant. */
export function newYork(date: Date): { hours: number; weekday: number; clock: string; day: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const day = get("weekday");
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
  return { hours: hour + minute / 60, weekday, clock: `${get("hour")}:${get("minute")}`, day };
}
