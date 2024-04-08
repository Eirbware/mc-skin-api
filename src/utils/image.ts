import fs from 'fs';
import { PNG } from 'pngjs';

export default class Image {
	private obj: PNG;

	static fromBuffer(buffer: Buffer): Image {
		return new Image(PNG.sync.read(buffer));
	}

	static fromFile(filename: string): Image {
		return Image.fromBuffer(fs.readFileSync(filename));
	}

	static create(width: number, height: number): Image {
		return new Image(new PNG({ width, height }));
	}

	static copy(image: Image): Image {
		const obj = new PNG({ width: image.width, height: image.height });
		image.obj.data.copy(obj.data);
		return new Image(obj);
	}

	constructor(obj: PNG) {
		this.obj = obj;
	}

	_getIndex(x: number, y: number): number {
		return (this.obj.width * y + x) << 2;
	}

	get width(): number {
		return this.obj.width;
	}
	get height(): number {
		return this.obj.height;
	}

	getPixel(x: number, y: number): [number, number, number, number] {
		const idx = this._getIndex(x, y);
		return [
			this.obj.data[idx],
			this.obj.data[idx + 1],
			this.obj.data[idx + 2],
			this.obj.data[idx + 3]
		]
	}

	setPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
		const idx = this._getIndex(x, y);
		this.obj.data[idx] = r;
		this.obj.data[idx + 1] = g;
		this.obj.data[idx + 2] = b;
		this.obj.data[idx + 3] = a;
	}

	clearPixel(x: number, y: number) {
		this.setPixel(x, y, 0, 0, 0, 0);
	}

	clearRect(x1: number, y1: number, x2: number, y2: number) {
		for (let y = y1; y <= y2; y++)
			for (let x = x1; x <= x2; x++)
				this.clearPixel(x, y);
	}

	isEmpty(x: number, y: number): boolean {
		return this.obj.data[this._getIndex(x, y) + 3] === 0;
	}

	isRectEmpty(x1: number, y1: number, x2: number, y2: number): boolean {
		for (let y = y1; y < y2; y++)
			for (let x = x1; x < x2; x++)
				if (!this.isEmpty(x, y))
					return false;
		return true;
	}

	isOpaque(): boolean {
		for (let y = 0; y < this.height; y++)
			for (let x = 0; x < this.width; x++)
				if (this.obj.data[this._getIndex(x, y) + 3] !== 255)
					return false;
		return true;
	}

	blit(src: Image, sx: number, sy: number, w: number, h: number, dx: number, dy: number) {
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const pixel = src.getPixel(sx + x, sy + y);
				this.setPixel(dx + x, dy + y, ...pixel);
			}
		}
	}

	save(filename: string) {
		fs.writeFileSync(filename, PNG.sync.write(this.obj));
	}

	getBuffer(): Buffer {
		return PNG.sync.write(this.obj);
	}
}