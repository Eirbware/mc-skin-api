import Image from "./image";
import * as transform from "./transform";

function inRect(x: number, y: number, x1: number, y1: number, x2: number, y2: number): boolean {
	return x >= x1 && x < x2 && y >= y1 && y < y2;
}

const isHead = (x: number, y: number): boolean => inRect(x, y, 8, 0, 24, 8) || inRect(x, y, 0, 8, 32, 16);
const isBody = (x: number, y: number): boolean => inRect(x, y, 20, 16, 36, 20) || inRect(x, y, 16, 20, 40, 32);
const isRLeg = (x: number, y: number): boolean => inRect(x, y, 4, 16, 12, 20) || inRect(x, y, 0, 20, 16, 32);
const isRArm = (x: number, y: number): boolean => inRect(x, y, 44, 16, 52, 20) || inRect(x, y, 40, 20, 56, 32);
const isLLeg = (x: number, y: number): boolean => inRect(x, y, 20, 48, 28, 52) || inRect(x, y, 16, 52, 32, 64);
const isLArm = (x: number, y: number): boolean => inRect(x, y, 36, 48, 44, 52) || inRect(x, y, 32, 52, 48, 64);

const toHead = (x: number, y: number): [number, number] => [x + 32, y];
const toBody = (x: number, y: number): [number, number] => [x, y + 16];
const toRLeg = (x: number, y: number): [number, number] => [x, y + 16];
const toRArm = (x: number, y: number): [number, number] => [x, y + 16];
const toLLeg = (x: number, y: number): [number, number] => [x - 16, y];
const toLArm = (x: number, y: number): [number, number] => [x + 16, y];

const parts: [((x: number, y: number) => boolean), ((x: number, y: number) => [number, number])][] = [
	[isHead, toHead],
	[isBody, toBody],
	[isRLeg, toRLeg],
	[isRArm, toRArm],
	[isLLeg, toLLeg],
	[isLArm, toLArm]
];

// Clear the pixel above if the skin's overlay hides it
function clearOverlay(skin: Image, accessory: Image, x: number, y: number) {
	// Find the skin part the pixel belongs to
	for (const [isPart, toPart] of parts) {
		// Check if the pixel is part of the current skin part
		if (!isPart(x, y))
			continue;
		const [nx, ny] = toPart(x, y);
		// Check if the accessory is transparent on the pixel above (x, y)
		if (!accessory.isEmpty(nx, ny))
			continue;
		skin.clearPixel(...toPart(x, y));
	}
}

// Clear every overlay on the skin
export function removeOverlay(skin: Image) {
	// In 64x32 skins, the only overlay is on the head
	skin.clearRect(32, 0, 63, 15); // Head

	if (skin.height === 64) {
		skin.clearRect(40, 32, 55, 47); // Right arm
		skin.clearRect(0, 32, 15, 47); // Right leg
		skin.clearRect(0, 48, 15, 63); // Left leg
		skin.clearRect(48, 48, 63, 63); // Left arm
	}
}

export function mergeAccessory(skin: Image, accessory: Image, hideOverlay: boolean): Image {
	let result = Image.copy(skin);
	accessory = Image.copy(accessory);

	// If the skin doesn't have any alpha != 255, remove every overlay
	if (result.isOpaque())
		removeOverlay(result);

	// Upgrade skin to 64x64 if not already
	if (result.height !== 64) {
		console.log(`Upgrading skin to 64x64`);
		result = transform.upgrade(result);
	}

	// Convert accessory to slim / wide if the skin is slim / wide
	const isSlimSkin = transform.isSlim(result);
	const isAccessorySlim = transform.isSlim(accessory);
	if (isSlimSkin && !isAccessorySlim)
		accessory = transform.toSlim(accessory);
	if (!isSlimSkin && isAccessorySlim)
		accessory = transform.toWide(accessory);

	for (let y = 0; y < result.height; y++) {
		for (let x = 0; x < result.width; x++) {
			if (accessory.isEmpty(x, y))
				continue;
			result.setPixel(x, y, ...accessory.getPixel(x, y));
			// Here, the pixel is now set to the accessory's pixel color.
			if (hideOverlay)
				clearOverlay(result, accessory, x, y);
		}
	}

	return result;
}