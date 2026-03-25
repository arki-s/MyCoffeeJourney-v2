import nativewindPreset from "nativewind/preset";
import { colors } from "./app/main/theme/colors";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./App.{js,jsx,ts,tsx}",
  "./app/**/*.{js,jsx,ts,tsx}",
  "./features/**/*.{js,jsx,ts,tsx}",
  "./hooks/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
];
export const presets = [nativewindPreset];
export const theme = {
  extend: {
      colors,
  }
};
export const plugins = [];
