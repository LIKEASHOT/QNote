import sys
from PIL import Image, ImageChops

def remove_background_pure_pil(input_path, output_path, thresh=240):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Get corner pixel as reference background
    bg_color = img.getpixel((5, 5))[:3]
    
    # Create mask: calculate difference from bg_color
    pixels = img.load()
    
    # Flood-fill from corners to find outside background
    from collections import deque
    visited = set()
    queue = deque()
    
    def is_close(c1, c2, tolerance=30):
        return sum(abs(a - b) for a, b in zip(c1[:3], c2[:3])) < tolerance * 3
    
    for x in range(width):
        if is_close(pixels[x, 0], bg_color): queue.append((x, 0)); visited.add((x, 0))
        if is_close(pixels[x, height-1], bg_color): queue.append((x, height-1)); visited.add((x, height-1))
    for y in range(height):
        if is_close(pixels[0, y], bg_color): queue.append((0, y)); visited.add((0, y))
        if is_close(pixels[width-1, y], bg_color): queue.append((width-1, y)); visited.add((width-1, y))
        
    while queue:
        x, y = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                if is_close(pixels[nx, ny], bg_color, tolerance=35):
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                    
    # Now set alpha: visited pixels become transparent, with soft feathering on boundary
    for x, y in visited:
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        
    # Soft edge feathering
    for x, y in list(visited):
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                r, g, b, a = pixels[nx, ny]
                if a == 255:
                    pixels[nx, ny] = (r, g, b, 200)

    img.save(output_path, "PNG")
    print(f"Successfully created clean transparent icon at {output_path}")

if __name__ == "__main__":
    remove_background_pure_pil(sys.argv[1], sys.argv[2])
