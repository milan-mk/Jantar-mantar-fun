import Phaser from 'phaser';

/**
 * Turns an SVG string into a Phaser texture by decoding it through an
 * HTMLImageElement. Resolves once the texture exists; rejects if the browser
 * could not decode the SVG (reported to the UI by BootScene).
 */
export function addSvgTexture(
  scene: Phaser.Scene,
  key: string,
  svg: string,
  width: number,
  height: number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (scene.textures.exists(key)) {
      resolve();
      return;
    }
    const img = new Image(width, height);
    img.onload = () => {
      if (!scene.textures.exists(key)) scene.textures.addImage(key, img);
      resolve();
    };
    img.onerror = () => reject(new Error(`Could not decode artwork "${key}"`));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
