import sys
from PIL import Image

def make_clean_cutout(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # 计算该像素的平均亮度
        brightness = (r + g + b) / 3.0
        
        # 1. 如果接近纯白，设为完全透明
        if r > 242 and g > 242 and b > 242:
            new_data.append((r, g, b, 0))
        # 2. 如果在边缘过渡区，平滑计算羽化 Alpha，消除白边
        elif brightness > 230:
            alpha = int(((245 - brightness) / 15.0) * 255)
            alpha = max(0, min(255, alpha))
            new_data.append((r, g, b, alpha))
        # 3. 物体本身及底部柔和阴影，完全保留
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"✓ 完美镂空图已生成: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 make_clean_cutout.py <input> <output>")
        sys.exit(1)
    make_clean_cutout(sys.argv[1], sys.argv[2])
