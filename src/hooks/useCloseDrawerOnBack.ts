import { useEffect, useRef } from "react";
import { create } from "zustand";

type DrawerBackEntry = {
  close: () => void;
  id: number;
};

type DrawerBackStackState = {
  entries: DrawerBackEntry[];
  register: (entry: DrawerBackEntry) => void;
  unregister: (id: number) => void;
};

// Stack of currently-open drawers. A single <DrawerBackHandler /> at the
// router root consumes it, because React Router only supports one active
// useBlocker at a time — per-drawer blockers would cancel each other out.
export const useDrawerBackStack = create<DrawerBackStackState>((set) => ({
  entries: [],
  register: (entry) =>
    set((state) => ({ entries: [...state.entries, entry] })),
  unregister: (id) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),
}));

let nextEntryId = 0;

type UseCloseDrawerOnBackOptions = {
  isOpen: boolean;
  onClose: () => void;
};

// While the drawer is open, registers it on the back-stack so the browser
// back button closes it (keeping the URL) instead of leaving the page.
export function useCloseDrawerOnBack({
  isOpen,
  onClose,
}: UseCloseDrawerOnBackOptions) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const id = ++nextEntryId;
    const { register, unregister } = useDrawerBackStack.getState();

    register({ close: () => onCloseRef.current(), id });

    return () => unregister(id);
  }, [isOpen]);
}
