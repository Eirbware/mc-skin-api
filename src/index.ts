import express from 'express';
import * as handlers from './handlers';

const app = express();
const port = process.env.PORT || 3000;

// List available accessories
app.get('/accessories', async (req, res) => {
	res.json(await handlers.getAccessories());
});

app.get('/skins', async (req, res) => {
	res.json(await handlers.getSkins());
})

app.get('/skins/:skin', async (req, res) => {
	const skinName = req.params.skin;
	let skin = await handlers.getSkin(skinName);
	if(skin == null)
		return res.status(404).send('Skin not found');
	res.set('Content-Type', 'image/png');
	res.set('Content-Disposition', `attachment; filename=${skinName}.png`);
	res.send(skin);
})

// Fetch default user skin
app.get('/skin/:username', async (req, res) => {
	// Parse user field
	const user = req.params.username;
	if (!user)
		return res.status(400).send('Missing user field');
	if (typeof user !== 'string')
		return res.status(400).send('User field must be a string');

	// Fetch skin and send response
	let skin = await handlers.fetchSkin(user);
	if (skin === null)
		return res.status(404).send('User not found');

	res.set('Content-Type', 'image/png');
	res.set('Content-Disposition', `attachment; filename=${user}.png`);
	res.send(skin);
});

// Apply accessory to user skin
// Supported query parameters:
// - user: Minecraft username
// - url: Skin URL (exclusive with user)
// - accessory: Accessory name
// - hide_overlay: Hide the skin overlay (default: true)
app.get('/merge', async (req, res) => {
	const t = performance.now();

	if (!req.query.user && !req.query.url)
		return res.status(400).send('Missing user or url field in url' + req.url);
	if (req.query.user && req.query.url)
		return res.status(400).send('Provide only one of user or url fields');

	// Parse accessory field
	let accessory = req.query.accessory;
	if (!accessory)
		return res.status(400).send('Missing accessory');
	if (typeof accessory !== 'string')
		return res.status(400).send('Accessory field must be a string');
	accessory = accessory.replace(/[^a-z0-9_]/gi, '');
	if (!(await handlers.accessoryExists(accessory)))
		return res.status(404).send('Accessory not found');

	// Parse user and url fields
	const user = req.query.user;
	if (user && typeof user !== 'string')
		return res.status(400).send('User field must be a string');
	let url = req.query.url;
	if (url && typeof url !== 'string')
		return res.status(400).send('URL field must be a string');
	if (url)
		url = decodeURIComponent(url);

	// Parse hideOverlay field
	const hideOverlay = !(req.query.hide_overlay === 'false');

	// Apply accessory on skin
	let skin;
	if (user)
		skin = await handlers.applyWithUsername(user, accessory, hideOverlay);
	else if (url)
		skin = await handlers.applyWithURL(url, accessory, hideOverlay);

	if (skin === null)
		return res.status(404).send('Error fetching skin');

	// Send response
	const filename = user ? `${user}_${accessory}` : `skin_${accessory}`;

	res.set('Content-Type', 'image/png');
	res.set('Content-Disposition', `attachment; filename=${filename}.png`);
	res.send(skin);

	console.log(`Processed in ${performance.now() - t}ms`);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log(`Access the API at http://localhost:${port}`);
	const time = new Date().toLocaleString();
	console.log(`Started at ${time}`);
});
