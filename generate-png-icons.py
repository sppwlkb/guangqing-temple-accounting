#!/usr/bin/env python3
"""
生成廣清宮記帳軟體的 PNG 圖標
"""

from PIL import Image, ImageDraw
import os

def create_temple_icon(size):
    # 創建畫布
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 背景色
    bg_color = '#667eea'
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=int(size*0.125), fill=bg_color)
    
    # 縮放比例
    scale = size / 192
    
    # 屋頂 (梯形)
    roof_points = [
        (32*scale, 80*scale),   # 左下
        (64*scale, 50*scale),   # 左上
        (128*scale, 50*scale),  # 右上
        (160*scale, 80*scale)   # 右下
    ]
    draw.polygon(roof_points, fill='#f39c12', outline='#e67e22')
    
    # 主體建築
    building_left = 40 * scale
    building_top = 80 * scale
    building_width = 112 * scale
    building_height = 60 * scale
    
    draw.rectangle([building_left, building_top, 
                   building_left + building_width, 
                   building_top + building_height], 
                  fill='#e74c3c', outline='#c0392b')
    
    # 門
    door_width = 16 * scale
    door_height = 40 * scale
    door_left = (size - door_width) / 2
    door_top = building_top + 20 * scale
    
    draw.rectangle([door_left, door_top, 
                   door_left + door_width, 
                   door_top + door_height], 
                  fill='#8b4513')
    
    # 柱子
    pillar_width = 8 * scale
    pillar_height = building_height
    
    # 左柱
    draw.rectangle([building_left + 12*scale, building_top,
                   building_left + 12*scale + pillar_width,
                   building_top + pillar_height], 
                  fill='#d4af37')
    
    # 右柱  
    draw.rectangle([building_left + building_width - 20*scale, building_top,
                   building_left + building_width - 12*scale,
                   building_top + pillar_height], 
                  fill='#d4af37')
    
    # 香爐
    incense_center_x = size / 2
    incense_center_y = 65 * scale
    incense_radius = 12 * scale
    
    draw.ellipse([incense_center_x - incense_radius, 
                 incense_center_y - incense_radius,
                 incense_center_x + incense_radius, 
                 incense_center_y + incense_radius], 
                fill='#8b4513', outline='#654321')
    
    # 香煙 (三條線)
    smoke_y_start = incense_center_y - incense_radius - 2*scale
    smoke_y_end = smoke_y_start - 15*scale
    
    for i, x_offset in enumerate([-3*scale, 0, 3*scale]):
        draw.line([incense_center_x + x_offset, smoke_y_start,
                  incense_center_x + x_offset + (i-1)*2*scale, smoke_y_end], 
                 fill='#bdc3c7', width=int(2*scale))
    
    return img

def main():
    # 生成不同尺寸的圖標
    sizes = [16, 32, 48, 96, 192, 512]
    
    for size in sizes:
        icon = create_temple_icon(size)
        filename = f'icon-{size}.png'
        icon.save(filename, 'PNG')
        print(f'✅ 已生成: {filename}')
    
    # 生成 favicon.ico (多尺寸)
    favicon_sizes = [16, 32, 48]
    favicon_images = [create_temple_icon(size) for size in favicon_sizes]
    favicon_images[0].save('favicon.ico', format='ICO', sizes=[(s, s) for s in favicon_sizes])
    print('✅ 已生成: favicon.ico')

if __name__ == '__main__':
    main()