import fs from 'fs';
import fsPromises from 'fs/promises';
import Image from './utils/image';
import * as fetcher from './utils/fetcher';
import * as merger from './utils/merger';

const accessoryFolder = 'accessories';
const skinsFolder = 'skins';

function getAccessoryPath(accessory: string): string {
	return `${accessoryFolder}/${accessory}.png`;
}

function getSkinPath(skinName: string): string {
	return `${skinsFolder}/${skinName}.png`;
}

export async function getAccessories(): Promise<string[]> {
	const files = await fsPromises.readdir(accessoryFolder);
	return files.map(file => file.replace('.png', ''));
}

export async function getSkins(): Promise<string[]> {
	const files = await fsPromises.readdir(skinsFolder);
	return files.map(file => file.replace('.png', ''));
}

export async function getSkin(skinName: string): Promise<Buffer | null> {
	const path = getSkinPath(skinName);
	try {
		await fsPromises.access(path, fs.constants.F_OK | fs.constants.R_OK);
		const img = Image.fromFile(getSkinPath(skinName));
		return img.getBuffer();
	} catch (e) {
		console.log(e);
		return null;
	}
}

export async function accessoryExists(accessory: string): Promise<boolean> {
	try {
		await fsPromises.access(getAccessoryPath(accessory), fs.constants.F_OK | fs.constants.R_OK);
		return true;
	} catch {
		return false;
	}
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
