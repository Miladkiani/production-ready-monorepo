"use client";

import { useRef } from "react";
import type { DrawerRefType } from "./Drawer";

export const useDrawer = <TData = unknown>() => {
  return useRef<DrawerRefType<TData>>(null);
};
