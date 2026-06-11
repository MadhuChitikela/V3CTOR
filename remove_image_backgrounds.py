import os
import shutil
from PIL import Image, ImageDraw

def main():
    # Define directories relative to this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    img_dir = os.path.join(current_dir, "images")
    backup_dir = os.path.join(img_dir, "backup")
    
    # Target images from the three sections: Services, Innovations, Process
    target_images = [
        # Services Section
        "service_web_mobile.png",
        "service_ai_ml.png",
        "service_ieee_project.png",
        "service_hackathon.png",
        
        # Innovations Section
        "project_defectvision.png",
        "project_smart_crop.png",
        "project_freshora.png",
        "project_autoflowops.png",
        
        # Process Section
        "process_step1.png",
        "process_step2.png",
        "process_step3.png",
        "process_step4.png"
    ]
    
    # Ensure backup directory exists
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"Created backup directory: {backup_dir}")
        
    print("Starting background removal process for section images...")
    print("-" * 65)
    
    success_count = 0
    for filename in target_images:
        src_path = os.path.join(img_dir, filename)
        if not os.path.exists(src_path):
            print(f"SKIPPED: {filename} (File not found in images/)")
            continue
            
        try:
            # 1. Back up the original file
            backup_path = os.path.join(backup_dir, filename)
            if not os.path.exists(backup_path):
                shutil.copy2(src_path, backup_path)
                print(f"Backed up: {filename} -> images/backup/{filename}")
            else:
                print(f"Backup already exists for: {filename}")
                
            # 2. Open image and convert to RGBA
            img = Image.open(src_path).convert("RGBA")
            width, height = img.size
            
            # 3. Apply floodfill from corners (with safety checks for dark pixels)
            # Threshold 75 is used to cleanly remove gradient backgrounds without leaking into subjects.
            corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
            for corner in corners:
                color = img.getpixel(corner)
                # Only start floodfill if the corner pixel is relatively bright/light (sum of RGB > 300)
                # to protect dark graphic elements that might touch the image borders (e.g. process_step4).
                if sum(color[:3]) > 300:
                    ImageDraw.floodfill(img, corner, (0, 0, 0, 0), thresh=75)
                    
            # 4. Save processed transparent PNG back to images/
            img.save(src_path, "PNG")
            print(f"SUCCESS: Removed background for {filename}")
            success_count += 1
            
        except Exception as e:
            print(f"ERROR processing {filename}: {e}")
            
    print("-" * 65)
    print(f"Process completed. Successfully updated {success_count} / {len(target_images)} images.")

if __name__ == "__main__":
    main()
