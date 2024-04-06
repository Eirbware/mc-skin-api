import numpy as np
from skimage import color


def change_hue(image, target_hue):
    rgb = image[:, :, :3]
    alpha = image[:, :, 3]
    hsv = color.rgb2hsv(rgb)
    median_hue = np.median(hsv[:, :, 0])
    hue_offsets = hsv[:, :, 0] - median_hue
    hsv[:, :, 0] = hsv[:, :, 0] + hue_offsets + target_hue
    rgb = color.hsv2rgb(hsv)
    return np.dstack((rgb, alpha))


if __name__ == '__main__':
    import matplotlib.pyplot as plt
    import sys

    if len(sys.argv) < 2:
        print(f'Usage: {sys.argv[0]} filepath [hue]', file=sys.stderr)
        sys.exit(1)

    filepath = sys.argv[1]
    filename = filepath.split('/')[-1].split('.')[0]

    skin = plt.imread(sys.argv[1])

    if len(sys.argv) == 3:
        target_hue = float(sys.argv[2])
        if not 0 <= target_hue <= 1:
            print('Hue must be in the range [0, 1]', file=sys.stderr)
            sys.exit(1)
        result = change_hue(skin, target_hue)
        plt.imsave(f'output/hue_{filename}_{target_hue:.2f}.png', result)
        print(f'Saved to output/hue_{filename}_{target_hue:.2f}.png')
        sys.exit(0)

    plt.figure(figsize=(10, 10))
    plt.suptitle(f'Hue variations for {filename} accessory')

    for i, hue in enumerate(np.linspace(0, 1, 16)):
        result = change_hue(skin, hue)
        plt.subplot(4, 4, i + 1)
        plt.imshow(result)
        plt.text(0, 0, f'{hue:.2f}', fontsize=10)
        plt.axis('off')

    plt.tight_layout()
    plt.savefig(f'output/hue_{filename}')
    print(f'Saved to output/hue_{filename}.png')
    plt.show()
