import os
from PIL import Image

workspace = r"c:\Users\chiti\Desktop\V3CTOR"
mockup_path = os.path.join(workspace, "images", "raw_mockup.png")

img = Image.open(mockup_path)
# Crop the header area (top 90 pixels)
header = img.crop((0, 0, 1024, 90))
header.save(os.path.join(workspace, "images", "header_mockup.png"))
print("Saved header_mockup.png")
