
'''
import random

HEIGHT = 20
WIDTH = 200

# Base empty level
level = [[0 for _ in range(WIDTH)] for _ in range(HEIGHT)]

# Add ground
for x in range(WIDTH):
    if x % 30 in range(25):  # occasional pits
        level[HEIGHT-1][x] = 1

# Add spikes and coins on ground
for x in range(WIDTH):
    if level[HEIGHT-1][x] == 1:
        if random.random() < 0.05:
            level[HEIGHT-2][x] = 3  # spike
        elif random.random() < 0.1:
            level[HEIGHT-3][x] = 4  # coin above ground

# Add platforms
for x in range(5, WIDTH-5, 15):
    y = random.randint(8, 14)
    for i in range(random.randint(4, 8)):
        if x + i < WIDTH:
            level[y][x + i] = 2
            if random.random() < 0.3:
                level[y-1][x + i] = 4  # coin above platform

# Add occasional floating coin clusters
for _ in range(25):
    cx = random.randint(10, WIDTH-10)
    cy = random.randint(4, 10)
    for i in range(-1, 2):
        for j in range(-1, 2):
            if random.random() < 0.7:
                level[cy + j][cx + i] = 4

# Add tall spike traps (3s) in pit areas
for x in range(WIDTH):
    if level[HEIGHT-1][x] == 0 and random.random() < 0.2:
        for y in range(HEIGHT-3, HEIGHT):
            level[y][x] = 3

# Print or export
print("[")
for row in level:
    print("  " + str(row) + ",")
print("]")
'''
import random
import math

HEIGHT = 20
WIDTH = 200

# Level grid (0=empty, 1=ground, 2=platform, 3=spike, 4=coin)
level = [[0 for _ in range(WIDTH)] for _ in range(HEIGHT)]

# === Smooth noise-based terrain generation ===
def smooth_noise(x, scale=0.05, amplitude=3):
    """Simple 1D smooth pseudo-noise using sine waves."""
    return math.sin(x * scale) * amplitude + math.sin(x * scale * 0.5) * amplitude / 2

base_ground = HEIGHT - 2
ground_heights = []
for x in range(WIDTH):
    # Create smooth rolling terrain
    offset = smooth_noise(x, scale=random.uniform(0.03, 0.07), amplitude=random.randint(2, 4))
    height = base_ground - int(offset)
    ground_heights.append(height)

# === Carve pits ===
for _ in range(10):
    pit_start = random.randint(10, WIDTH - 15)
    pit_width = random.randint(2, 6)
    for i in range(pit_start, pit_start + pit_width):
        if 0 <= i < WIDTH:
            ground_heights[i] = HEIGHT  # no ground (pit)

# === Draw ground and dirt ===
for x, ground_y in enumerate(ground_heights):
    if ground_y < HEIGHT:
        level[ground_y][x] = 1
        for y in range(ground_y + 1, HEIGHT):
            level[y][x] = 1  # fill dirt

# === Place spikes and coins on ground ===
for x in range(WIDTH):
    g_y = ground_heights[x]
    if g_y < HEIGHT:
        # Surface spikes
        if random.random() < 0.05:
            level[g_y - 1][x] = 3
        # Coins
        elif random.random() < 0.12:
            level[g_y - 2][x] = 4

# === Add platforms above terrain ===
x = 5
while x < WIDTH - 10:
    platform_y = random.randint(8, 14)
    platform_len = random.randint(4, 7)
    for i in range(platform_len):
        if x + i < WIDTH:
            level[platform_y][x + i] = 2
            if random.random() < 0.3:
                level[platform_y - 1][x + i] = 4
    x += random.randint(12, 20)

# === Floating coin clusters ===
for _ in range(20):
    cx = random.randint(10, WIDTH - 10)
    cy = random.randint(4, 10)
    for dx in range(-1, 2):
        for dy in range(-1, 2):
            if random.random() < 0.7 and 0 <= cy + dy < HEIGHT:
                level[cy + dy][cx + dx] = 4

# === Improved spike traps (pits & clusters) ===
for x in range(WIDTH):
    g_y = ground_heights[x]
    if g_y >= HEIGHT:  # pit area
        if random.random() < 0.3:
            # tall central spike
            trap_h = random.randint(2, 4)
            for y in range(HEIGHT - trap_h, HEIGHT):
                level[y][x] = 3
        elif random.random() < 0.15:
            # cluster trap (grouped spikes)
            for i in range(-1, 2):
                if 0 <= x + i < WIDTH:
                    for y in range(HEIGHT - 2, HEIGHT):
                        level[y][x + i] = 3

# === Optional: Add bonus floating coins near pit edges ===
for x in range(1, WIDTH - 1):
    if ground_heights[x] >= HEIGHT and ground_heights[x - 1] < HEIGHT:
        # left edge of pit
        level[ground_heights[x - 1] - 3][x - 1] = 4
    elif ground_heights[x] >= HEIGHT and ground_heights[x + 1] < HEIGHT:
        # right edge of pit
        level[ground_heights[x + 1] - 3][x + 1] = 4

# === Print level as array ===
print("[")
for row in level:
    print("  " + str(row) + ",")
print("]")
