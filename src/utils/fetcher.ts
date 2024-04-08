import Image from "./image";

export async function fetchSkin(username: string): Promise<Image | null> {
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
		.then(buffer => Image.fromBuffer(buffer))
		.catch(() => null);
}

function isSkinValid(skin: Image | null): boolean {
	if (skin === null)
		return false;
	if (skin.height !== 64)
		return false;
	if (skin.width !== 64 && skin.width !== 32)
		return false;
	return true;
}

// Max PNG size for 64x64 skin: 64 * 64 * 4 = 16384 bytes
const TIMEOUT = 10000;

// If the data is larger than 1MB, it's probably not a skin
export async function fetchSkinFromURL(url: string): Promise<Image | null> {
	/* const looksFine = await fetch(url, {
		method: "HEAD"
	})
		.then(res => {
			// Check content length and type
			const length = res.headers.get('Content-Length');
			const type = res.headers.get('Content-Type');
			if (length === null || type === null)
				return false;
			if (type !== 'image/png')
				return false;
			if (parseInt(length) > maxSkinSize)
				return false;
			return true;
		})
		.catch(() => false);

	if (!looksFine)
		return null; */

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

	let skin = null;
	try {
		skin = await fetch(url, { signal: controller.signal })
			.then(res => res.blob())
			.then(blob => blob.arrayBuffer())
			.then(buffer => Buffer.from(buffer))
			.then(buffer => Image.fromBuffer(buffer))
			.catch(() => null);
	} catch (error) {
		console.error(error);
	} finally {
		clearTimeout(timeoutId);
	}

	if (!isSkinValid(skin))
		return null;

	return skin;
}