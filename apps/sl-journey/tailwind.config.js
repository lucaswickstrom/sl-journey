const { preset } = require("@sl-journey/ui/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [preset],
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
	],
};
