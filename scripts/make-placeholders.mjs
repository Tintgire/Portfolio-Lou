import { writeFileSync, mkdirSync } from 'node:fs';
import { Buffer } from 'node:buffer';

// 1×1 red JPEG (covers will be replaced with real photos later — this is just to make next/image not crash)
const RED_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AB//Z',
  'base64',
);

const slugs = ['bold-lipstick', 'latex-couture'];
for (const slug of slugs) {
  mkdirSync(`public/images/works/${slug}`, { recursive: true });
  writeFileSync(`public/images/works/${slug}/cover.jpg`, RED_JPEG);
  writeFileSync(`public/images/works/${slug}/01.jpg`, RED_JPEG);
}
mkdirSync('public/images/about', { recursive: true });
writeFileSync('public/images/about/portrait.jpg', RED_JPEG);

console.log('Placeholders created.');

const RED_PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64',
);
writeFileSync('public/lipstick-fallback.png', RED_PNG_1X1);
console.log('lipstick-fallback.png created.');
