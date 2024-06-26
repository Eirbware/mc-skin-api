import Image from './image';

// Upgrade 64x32 skin to 64x64
export function upgrade(image: Image): Image {
	const output = Image.create(64, 64);

	// Copy the top half, as nothing changes
	output.blit(image, 0, 0, 64, 32, 0, 0);

	// Create left leg using right leg
	output.blit(image, 4, 16, 4, 4, 20, 48); // Top
	output.blit(image, 8, 16, 4, 4, 24, 48); // Bottom
	output.blit(image, 0, 20, 4, 12, 24, 52); // Outside -> Inside
	output.blit(image, 4, 20, 4, 12, 20, 52); // Front
	output.blit(image, 8, 20, 4, 12, 16, 52); // Inside -> Outside
	output.blit(image, 12, 20, 4, 12, 28, 52); // Back

	// Create right arm using left arm
	output.blit(image, 44, 16, 4, 4, 36, 48); // Top
	output.blit(image, 48, 16, 4, 4, 40, 48); // Bottom
	output.blit(image, 40, 20, 4, 12, 40, 52); // Outside -> Inside
	output.blit(image, 44, 20, 4, 12, 36, 52); // Front
	output.blit(image, 48, 20, 4, 12, 32, 52); // Inside -> Outside
	output.blit(image, 52, 20, 4, 12, 44, 52); // Back

	return output;
}

// Convert 64x64 skin from wide to slim (3px arms instead of 4px)
export function toSlim(image: Image): Image {
	const output = Image.copy(image);

	function shortenRight(xo: number, yo: number) {
		output.clearRect(44 + xo, 16 + yo, 44 + xo, 19 + yo);
		output.blit(image, 45 + xo, 16 + yo, 3, 4, 44 + xo, 16 + yo); // Top
		output.clearRect(48 + xo, 16 + yo, 48 + xo, 19 + yo);
		output.blit(image, 49 + xo, 16 + yo, 3, 4, 47 + xo, 16 + yo); // Bottom

		output.clearRect(44 + xo, 20 + yo, 44 + xo, 31 + yo);
		output.blit(image, 45 + xo, 20 + yo, 3, 12, 44 + xo, 20 + yo); // Front
		output.clearRect(51 + xo, 20 + yo, 51 + xo, 31 + yo);
		output.blit(image, 48 + xo, 20 + yo, 4, 12, 47 + xo, 20 + yo); // Inside
		output.blit(image, 52 + xo, 20 + yo, 3, 12, 51 + xo, 20 + yo); // Back

		output.clearRect(50 + xo, 16 + yo, 51 + xo, 19 + yo);
		output.clearRect(54 + xo, 20 + yo, 55 + xo, 31 + yo);
	}

	shortenRight(0, 0); // Right arm (skin)
	shortenRight(0, 16); // Right arm (overlay)

	function shortenLeft(xo: number, yo: number) {
		output.clearRect(39 + xo, 48 + yo, 39 + xo, 51 + yo);
		output.blit(image, 40 + xo, 48 + yo, 3, 4, 39 + xo, 48 + yo); // Top
		output.clearRect(42 + xo, 48 + yo, 42 + xo, 51 + yo);

		output.clearRect(39 + xo, 52 + yo, 39 + xo, 63 + yo);
		output.blit(image, 40 + xo, 52 + yo, 4, 12, 39 + xo, 52 + yo); // Front
		output.clearRect(43 + xo, 52 + yo, 43 + xo, 63 + yo);
		output.clearRect(44 + xo, 52 + yo, 44 + xo, 63 + yo);
		output.blit(image, 45 + xo, 52 + yo, 3, 12, 43 + xo, 52 + yo); // Back

		output.clearRect(42 + xo, 48 + yo, 43 + xo, 51 + yo);
		output.clearRect(46 + xo, 52 + yo, 47 + xo, 63 + yo);
	}

	shortenLeft(0, 0); // Left arm (skin)
	shortenLeft(16, 0); // Left arm (overlay)

	return output;
}

// Rudimentary check to see if the given skin / accessory is slim
export function isSlim(image: Image): boolean {
	const right = image.isRectEmpty(50, 16, 52, 20) && image.isRectEmpty(54, 20, 56, 32);
	const left = image.isRectEmpty(42, 48, 44, 52) && image.isRectEmpty(46, 52, 48, 64);
	return right && left;
}

// Turns a slim skin / accessory into a wide skin / accessory
// Pixels far from the body are duplicated to obtain 4px arms
export function toWide(image: Image): Image {
	const output = Image.copy(image);

	function copyRightArm(xo: number, yo: number) {
		// Bottom
		output.blit(image, 47 + xo, 16 + yo, 3, 4, 49 + xo, 16 + yo);
		output.clearRect(47 + xo, 16 + yo, 48 + xo, 19 + yo);
		// Duplicate bottom line
		output.blit(image, 48 + xo, 16 + yo, 1, 4, 47 + xo, 16 + yo);

		// Top (duplicate at the same time)
		output.blit(image, 44 + xo, 16 + yo, 4, 4, 45 + xo, 16 + yo);

		// Back
		output.blit(image, 51 + xo, 20 + yo, 3, 12, 52 + xo, 20 + yo);
		output.clearRect(51 + xo, 20 + yo, 51 + xo, 31 + yo);
		// Duplicate back line
		output.blit(image, 53 + xo, 20 + yo, 1, 12, 55 + xo, 20 + yo);

		// Inside
		output.blit(image, 47 + xo, 20 + yo, 4, 12, 48 + xo, 20 + yo);
		output.clearRect(47 + xo, 20 + yo, 47 + xo, 31 + yo);

		// Front (duplicate at the same time)
		output.blit(image, 44 + xo, 20 + yo, 4, 12, 45 + xo, 20 + yo);
	}

	copyRightArm(0, 0); // Right arm (skin)
	copyRightArm(0, 16); // Right arm (overlay)

	function copyLeftArm(xo: number, yo: number) {
		// Bottom
		output.blit(image, 39 + xo, 48 + yo, 3, 4, 40 + xo, 48 + yo);
		output.clearRect(39 + xo, 48 + yo, 39 + xo, 51 + yo);
		// Duplicate bottom line
		output.blit(image, 41 + xo, 48 + yo, 1, 4, 43 + xo, 48 + yo);


		// Top, duplicate the same line
		output.blit(image, 38 + xo, 48 + yo, 1, 4, 39 + xo, 48 + yo);


		// Back
		output.blit(image, 43 + xo, 52 + yo, 3, 12, 45 + xo, 52 + yo);
		output.clearRect(43 + xo, 52 + yo, 44 + xo, 63 + yo);
		// Duplicate back line
		output.blit(image, 43 + xo, 52 + yo, 1, 12, 44 + xo, 52 + yo);

		// Outside
		output.blit(image, 39 + xo, 52 + yo, 4, 12, 40 + xo, 52 + yo);
		output.clearRect(39 + xo, 52 + yo, 39 + xo, 63 + yo);

		// Front, duplicate the same line
		output.blit(image, 38 + xo, 52 + yo, 1, 12, 39 + xo, 52 + yo);
	}

	copyLeftArm(0, 0); // Left arm (skin)
	copyLeftArm(16, 0); // Left arm (overlay)

	return output;
}