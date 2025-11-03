import nativewindPreset from "nativewind/preset";

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
  extend: {},
};
export const plugins = [];
