import numpy as np


# If the image has mostly transparent pixels on the arms,
# it will be considered slim.
def is_slim(image):
    def is_rect_empty(sx, sy, ex, ey):
        return np.all(image[sy:ey, sx:ex] == 0)
    right = is_rect_empty(50, 16, 52, 20) and is_rect_empty(54, 20, 56, 32)
    left = is_rect_empty(42, 48, 44, 52) and is_rect_empty(46, 52, 48, 64)
    return right and left


if __name__ == '__main__':
    import matplotlib.pyplot as plt
    import sys

    if len(sys.argv) != 2:
        print(f'Usage: {sys.argv[0]} filepath', file=sys.stderr)
        sys.exit(1)

    filepath = sys.argv[1]
    filename = filepath.split('/')[-1].split('.')[0]

    skin = plt.imread(sys.argv[1])
    result = is_slim(skin)
    print(f'{filename} seems to be {"slim" if result else "wide"}')
