import Image from './utils/image';
import * as transform from './utils/transform';

async function _fetchSkin(username: string): Promise<[boolean, Image] | null> {
	const id = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
		.then(res => res.json())
		.then(json => json.id)
		.catch(() => null);

	if (id === null)
		return null;

	const data = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`)
		.then(res => res.json())
		.then(json => json.properties[0].value)
		.then(value => JSON.parse(Buffer.from(value, 'base64').toString()))
		.catch(() => null);

	if (data === null)
		return null;
	if (!data.textures.SKIN)
		return null;

	return await fetch(data.textures.SKIN.url)
		.then(res => res.blob())
		.then(blob => blob.arrayBuffer())
		.then(buffer => Buffer.from(buffer))
		.then(buffer => [
			data.textures.SKIN.metadata?.model === 'slim',
			Image.fromBuffer(buffer)
		]);
}

export async function fetchSkin(username: string): Promise<Buffer | null> {
	const result = await _fetchSkin(username);
	if (result === null)
		return null;
	return result[1].getBuffer();
}

export async function applyAccessory(username: string, accessoryFile: string, hideOverlay: boolean = true): Promise<Buffer | null> {
	const result = await _fetchSkin(username);
	if (result === null)
		return null;

	let [isSlim, skin] = result;

	const time = performance.now();

	// Upgrade skin to 64x64 if not already
	if (skin.height !== 64) {
		console.log(`Upgrading ${username}'s skin to 64x64`);
		skin = transform.upgrade(skin);
	}

	// Load accessory and convert to slim if the skin is slim
	let accessory = Image.fromFile(accessoryFile);
	const isAccessorySlim = transform.isAccessorySlim(accessory);
	if (isSlim && !isAccessorySlim) {
		console.log(`Converting ${accessoryFile} to slim for ${username}`);
		accessory = transform.toSlim(accessory);
	}

	if (!isSlim && isAccessorySlim) {
		console.log(`Converting ${accessoryFile} to wide for ${username}`);
		accessory = transform.toWide(accessory);
	}

	// Apply accessory to skin
	for (let y = 0; y < skin.height; y++) {
		for (let x = 0; x < skin.width; x++) {
			if (accessory.isEmpty(x, y))
				continue;
			skin.setPixel(x, y, ...accessory.getPixel(x, y));
			// Here, the pixel is now set to the accessory's pixel color.
			//
			if (hideOverlay)
				transform.clearOverlay(skin, accessory, x, y);
		}
	}

	console.log(`Applied ${accessoryFile} to ${username}, done in ${performance.now() - time}ms`);

	return skin.getBuffer();
}