import fs from 'fs';
import Image from './utils/image';
import * as fetcher from './utils/fetcher';
import * as merger from './utils/merger';

const accessoryFolder = 'accessories';

function getAccessoryPath(accessory: string): string {
	return `${accessoryFolder}/${accessory}.png`;
}

export function getAccessories(): string[] {
	const files = fs.readdirSync(accessoryFolder);
	return files.map(file => file.replace('.png', ''));
}

export function accessoryExists(accessory: string): boolean {
	return fs.existsSync(getAccessoryPath(accessory));
}

export async function fetchSkin(username: string): Promise<Buffer | null> {
	const result = await fetcher.fetchSkin(username);
	if (result === null)
		return null;
	return result.getBuffer();
}

async function apply(skin: Image | null, accessoryName: string, hideOverlay: boolean): Promise<Buffer | null> {
	if (skin === null)
		return null;
	const accessory = Image.fromFile(getAccessoryPath(accessoryName));
	const result = merger.mergeAccessory(skin, accessory, hideOverlay);
	return result.getBuffer();
}

export async function applyWithUsername(username: string, accessory: string, hideOverlay: boolean = true): Promise<Buffer | null> {
	console.log(`Fetching skin for ${username}, applying accessory ${accessory}`);
	const skin = await fetcher.fetchSkin(username);
	return apply(skin, accessory, hideOverlay);
}

export async function applyWithURL(url: string, accessory: string, hideOverlay: boolean = true): Promise<Buffer | null> {
	console.log(`Fetching skin from ${url}, applying accessory ${accessory}`);
	const skin = await fetcher.fetchSkinFromURL(url);
	return apply(skin, accessory, hideOverlay);
}
