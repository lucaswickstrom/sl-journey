export type TransportMode = "metro" | "bus" | "train" | "tram" | "ferry";

const TRUNK_LINES = [
	"1",
	"2",
	"3",
	"4",
	"6",
	"172",
	"173",
	"176",
	"177",
	"178",
	"179",
];

export function getTransportColor(
	mode: TransportMode,
	lineNumber?: string,
): string {
	switch (mode) {
		case "metro":
			// Blue line: T10, T11
			if (lineNumber === "10" || lineNumber === "11") return "#0077C8";
			// Red line: T13, T14
			if (lineNumber === "13" || lineNumber === "14") return "#E4002B";
			// Green line: T17, T18, T19
			return "#009E49";
		case "train":
			return "#EC619F"; // Commuter rail
		case "tram":
			return "#ED8B00";
		case "bus":
			// Trunk lines (Blåbuss)
			if (lineNumber && TRUNK_LINES.includes(lineNumber)) return "#0077C8";
			return "#E4002B";
		case "ferry":
			return "#00A3E0";
		default:
			return "#6e6e6e";
	}
}
