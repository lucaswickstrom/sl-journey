const { preset } = require("./src/ui/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [preset],
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
};
