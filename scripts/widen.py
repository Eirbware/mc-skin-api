import numpy as np


def move_rect(image, sx, sy, w, h, dx, dy):
    image[dy:dy+h, dx:dx+w] = image[sy:sy+h, sx:sx+w]


def color_rect(image, sx, sy, w, h, color):
    image[sy:sy+h, sx:sx+w] = np.array(color, dtype=image.dtype)


def widen_right_arm(result, xo, yo, missing_color):
    move_rect(result, 47+xo, 16+yo, 3, 4, 49+xo, 16+yo)  # Bottom
    color_rect(result, 48+xo, 16+yo, 1, 4, missing_color)

    move_rect(result, 44+xo, 16+yo, 3, 4, 45+xo, 16+yo)  # Top
    color_rect(result, 44+xo, 16+yo, 1, 4, missing_color)

    move_rect(result, 51+xo, 20+yo, 3, 12, 52+xo, 20+yo)  # Back
    color_rect(result, 55+xo, 20+yo, 1, 12, missing_color)

    move_rect(result, 47+xo, 20+yo, 4, 12, 48+xo, 20+yo)  # Outside

    move_rect(result, 44+xo, 20+yo, 3, 12, 45+xo, 20+yo)  # Front
    color_rect(result, 44+xo, 20+yo, 1, 12, missing_color)


def widen_left_arm(result, xo, yo, missing_color):
    move_rect(result, 39+xo, 48+yo, 3, 4, 40+xo, 48+yo)  # Bottom
    color_rect(result, 39+xo, 48+yo, 1, 4, missing_color)
    color_rect(result, 43+xo, 48+yo, 1, 4, missing_color)

    move_rect(result, 43+xo, 52+yo, 3, 12, 45+xo, 52+yo)  # Back
    color_rect(result, 44+xo, 52+yo, 1, 12, missing_color)

    move_rect(result, 39+xo, 52+yo, 4, 12, 40+xo, 52+yo)  # Outside
    color_rect(result, 39+xo, 52+yo, 1, 12, missing_color)


def widen(image):
    result = np.copy(image)
    color = np.array([1, 0, 0, 1], dtype=np.float32)

    widen_right_arm(result, 0, 0, color)
    widen_right_arm(result, 0, 16, color)

    widen_left_arm(result, 0, 0, color)
    widen_left_arm(result, 16, 0, color)

    return result


if __name__ == '__main__':
    import matplotlib.pyplot as plt
    import sys

    from is_slim import is_slim

    if len(sys.argv) != 2:
        print(f'Usage: {sys.argv[0]} filepath', file=sys.stderr)
        sys.exit(1)

    filepath = sys.argv[1]
    filename = filepath.split('/')[-1].split('.')[0]

    skin = plt.imread(sys.argv[1])

    if not is_slim(skin):
        print('Error: Skin is not slim', file=sys.stderr)
        sys.exit(1)

    plt.imsave(f'output/{filename}_wide.png', widen(skin))
    print(f'Saved to output/{filename}_wide.png')
