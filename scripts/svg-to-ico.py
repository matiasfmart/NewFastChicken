#!/usr/bin/env python3
"""
Script para convertir SVG a ICO
Requiere: pip install pillow cairosvg
"""

import os
from pathlib import Path
try:
    from PIL import Image
    import cairosvg
except ImportError:
    print("Error: Se requieren las bibliotecas PIL y cairosvg")
    print("Instala con: pip install pillow cairosvg")
    exit(1)

def svg_to_ico(svg_path, ico_path, sizes=[16, 32, 48, 64, 128, 256]):
    """
    Convierte un archivo SVG a ICO con múltiples tamaños

    Args:
        svg_path: Ruta al archivo SVG
        ico_path: Ruta de salida del archivo ICO
        sizes: Lista de tamaños a incluir en el ICO
    """
    print(f"Convirtiendo {svg_path} → {ico_path}")

    # Crear imágenes PNG temporales en diferentes tamaños
    temp_images = []

    for size in sizes:
        # Convertir SVG a PNG en el tamaño específico
        png_data = cairosvg.svg2png(
            url=str(svg_path),
            output_width=size,
            output_height=size
        )

        # Abrir como imagen PIL
        from io import BytesIO
        img = Image.open(BytesIO(png_data))
        temp_images.append(img)
        print(f"  ✓ Generado tamaño {size}x{size}")

    # Guardar todas las imágenes como ICO
    temp_images[0].save(
        ico_path,
        format='ICO',
        sizes=[(img.width, img.height) for img in temp_images]
    )

    print(f"✅ ICO creado exitosamente: {ico_path}")
    print(f"   Tamaños incluidos: {', '.join(f'{s}x{s}' for s in sizes)}")

if __name__ == "__main__":
    # Rutas base
    project_root = Path(__file__).parent.parent
    icons_dir = project_root / "public" / "icons"

    # Crear directorio si no existe
    icons_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("FastChicken - Convertidor SVG a ICO")
    print("=" * 60)
    print()

    # Convertir ambos iconos
    svg_to_ico(
        icons_dir / "fastchicken-red.svg",
        icons_dir / "fastchicken-red.ico",
        sizes=[16, 32, 48, 64, 128, 256]
    )

    print()

    svg_to_ico(
        icons_dir / "fastchicken-black.svg",
        icons_dir / "fastchicken-black.ico",
        sizes=[16, 32, 48, 64, 128, 256]
    )

    print()
    print("=" * 60)
    print("✅ Conversión completada")
    print("=" * 60)
    print()
    print("Archivos generados:")
    print(f"  • {icons_dir / 'fastchicken-red.ico'} (ROJO - Para Caja)")
    print(f"  • {icons_dir / 'fastchicken-black.ico'} (NEGRO - Para Admin)")
    print()
    print("Próximo paso:")
    print("  1. Copia estos archivos .ico a tu máquina Windows")
    print("  2. Usa 'Bat To Exe Converter' para convertir tus .bat a .exe")
    print("  3. Asigna el icono correspondiente a cada .exe")
