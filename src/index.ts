import fs from 'fs';
import express from 'express';
import { applyAccessory, fetchSkin } from './skin';

const app = express();
const port = process.env.PORT || 3000;

// List available accessories
app.get('/accessories', (req, res) => {
	const files = fs.readdirSync('accessories');
	const accessories = files.map(file => file.replace('.png', ''));
	res.json(accessories);
});

// Fetch default user skin
app.get('/skin/:username', async (req, res) => {
	// Parse user field
	const user = req.params.username;
	if (!user)
		return res.status(400).send('Missing user field');
	if (typeof user !== 'string')
		return res.status(400).send('User field must be a string');

	// Fetch skin and send response
	let skin = await fetchSkin(user);
	if (skin === null)
		return res.status(404).send('User not found');

	res.set('Content-Type', 'image/png');
	res.set('Content-Disposition', `attachment; filename=${user}.png`);
	res.send(skin);
});

// Apply accessory to user skin
app.get('/merge', async (req, res) => {
	// Parse user field
	const user = req.query.user;
	if (!user)
		return res.status(400).send('Missing user field');
	if (typeof user !== 'string')
		return res.status(400).send('User field must be a string');

	// Parse accessory field
	let accessory = req.query.accessory;
	if (!accessory)
		return res.status(400).send('Missing accessory');
	if (typeof accessory !== 'string')
		return res.status(400).send('Accessory field must be a string');
	accessory = accessory.replace(/[^a-z0-9_]/gi, '');
	if (!fs.existsSync(`accessories/${accessory}.png`))
		return res.status(404).send('Accessory not found');

	// Apply accessory and send response
	const skin = await applyAccessory(user, `accessories/${accessory}.png`);
	if (skin === null)
		return res.status(404).send('User not found');

	res.set('Content-Type', 'image/png');
	res.set('Content-Disposition', `attachment; filename=${user}_${accessory}.png`);
	res.send(skin);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log(`Access the API at http://localhost:${port}`);
	const time = new Date().toLocaleString();
	console.log(`Started at ${time}`);
});