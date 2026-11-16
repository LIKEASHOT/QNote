from PIL import Image
from collections import deque

def cutout_to_transparent(in_path, out_path):
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    
    # Visited set for BFS
    visited = set()
    queue = deque()
    
    def is_white_bg(rgb):
        r, g, b = rgb[:3]
        # Any near-white pixel
        return r > 238 and g > 238 and b > 238
    
    # Initialize queue with all 4 border edges
    for x in range(w):
        if is_white_bg(pixels[x, 0]): queue.append((x, 0)); visited.add((x, 0))
        if is_white_bg(pixels[x, h-1]): queue.append((x, h-1)); visited.add((x, h-1))
    for y in range(h):
        if is_white_bg(pixels[0, y]): queue.append((0, y)); visited.add((0, y))
        if is_white_bg(pixels[w-1, y]): queue.append((w-1, y)); visited.add((w-1, y))
        
    while queue:
        x, y = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                if is_white_bg(pixels[nx, ny]):
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                    
    print(f"Total background pixels to clear: {len(visited)} / {w*h} ({len(visited)/(w*h)*100:.1f}%)")
    
    # Clear visited pixels to transparent
    for x, y in visited:
        pixels[x, y] = (255, 255, 255, 0)
        
    # Smooth 2-pixel anti-aliasing on the edges of the book
    edge_pixels = set()
    for x, y in visited:
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                edge_pixels.add((nx, ny))
                
    for x, y in edge_pixels:
        r, g, b, a = pixels[x, y]
        # calculate neighbor background count
        bg_neighbors = sum(1 for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]
                           if (x+dx, y+dy) in visited)
        alpha = int(255 * (1.0 - bg_neighbors * 0.18))
        pixels[x, y] = (r, g, b, max(80, alpha))
        
    img.save(out_path, "PNG")
    print(f"Saved transparent cutout to: {out_path}")

cutout_to_transparent(
    "/Users/likeashot/.gemini/antigravity/brain/db26662e-4bc7-4b6c-8fe1-2df3007d0c3d/floating_open_notebook_pen_1794799325482.jpg",
    "/Users/likeashot/Desktop/QNote/assets/icon.png"
)
