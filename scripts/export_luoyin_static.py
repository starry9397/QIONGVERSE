"""Export clean static Luoyin web avatars from the supplied GLB.

Usage:
  blender --background --python scripts/export_luoyin_static.py -- \
    source.glb desktop.glb mobile.glb

The source file is never overwritten.  This intentionally exports one plain
mesh without an armature or animation: the browser moves the model as a
single third-person avatar, which keeps the original material stable.
"""

from __future__ import annotations

import os
import sys

import bpy
from mathutils import Vector


def args_after_separator() -> tuple[str, str, str]:
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) != 3:
        raise SystemExit("Expected: source.glb desktop.glb mobile.glb")
    return tuple(os.path.abspath(item) for item in args)  # type: ignore[return-value]


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.cameras, bpy.data.lights, bpy.data.armatures):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def import_mesh(source: str) -> bpy.types.Object:
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=source)
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("The source GLB does not contain a mesh")

    # Keep only the actual imported character.  Some Blender startup/export
    # helpers can leave a primitive in the scene; selecting the largest mesh
    # and deleting every other object prevents that primitive from reaching
    # the browser as a black accessory.
    mesh = max(meshes, key=lambda item: len(item.data.vertices))
    for obj in list(bpy.context.scene.objects):
        if obj != mesh:
            bpy.data.objects.remove(obj, do_unlink=True)
    mesh.name = "SM_LuoyinStatic"
    # Keep the source GLB's native glTF Y-up orientation.  Blender's glTF
    # exporter writes this as the web-standard Y-up asset; the Z-up Spark
    # scene applies the conversion once at runtime.  Rotating here would
    # export a sideways character for Three.js.
    bpy.context.view_layer.objects.active = mesh
    mesh.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return mesh


def bounds(mesh: bpy.types.Object) -> tuple[float, float, float, float, float, float]:
    points = [mesh.matrix_world @ Vector(corner) for corner in mesh.bound_box]
    return (
        min(point.x for point in points),
        max(point.x for point in points),
        min(point.y for point in points),
        max(point.y for point in points),
        min(point.z for point in points),
        max(point.z for point in points),
    )


def normalize(mesh: bpy.types.Object, ratio: float, texture_size: int, target_height: float) -> None:
    bpy.context.view_layer.objects.active = mesh
    mesh.select_set(True)

    decimate = mesh.modifiers.new(name="WEB_DECIMATE", type="DECIMATE")
    decimate.ratio = ratio
    decimate.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=decimate.name)

    min_x, max_x, min_y, max_y, min_z, max_z = bounds(mesh)
    mesh.location.x -= (min_x + max_x) * 0.5
    # The supplied Blender scene is Z-up.  Center the horizontal Y axis and
    # place the feet at Z=0; the glTF exporter will perform its standard
    # Blender-Z to glTF-Y conversion for the browser.
    mesh.location.y -= (min_y + max_y) * 0.5
    mesh.location.z -= min_z
    bpy.context.view_layer.update()

    _, _, _, _, normalized_min_z, normalized_max_z = bounds(mesh)
    height = normalized_max_z - normalized_min_z
    if height <= 0:
        raise RuntimeError("The imported character has no measurable height")
    mesh.scale = (target_height / height,) * 3
    # Bake the centering translation into vertex data as well.  A non-zero
    # glTF node translation would be overwritten by the runtime floor solver,
    # putting the avatar below the SPZ ground plane.
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    # Keep the original PBR graph, but shrink packed images for web delivery.
    for image in bpy.data.images:
        if image.size[0] > texture_size or image.size[1] > texture_size:
            image.scale(texture_size, texture_size)
        image.pack()


def export(mesh: bpy.types.Object, output: str, mobile: bool) -> None:
    # User startup scripts can recreate Blender's default cube, camera or
    # light after import.  Remove every non-avatar object immediately before
    # export so runtime bounds cannot mistake a two-metre cube for Luoyin's
    # foot contact.
    for obj in list(bpy.context.scene.objects):
        if obj != mesh:
            bpy.data.objects.remove(obj, do_unlink=True)
    os.makedirs(os.path.dirname(output), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.export_scene.gltf(
        filepath=output,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_lights=False,
        export_cameras=False,
        export_animations=False,
        export_extras=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=8 if mobile else 6,
        export_draco_position_quantization=12 if mobile else 14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=10 if mobile else 12,
    )
    print(f"EXPORT_OK {output} bytes={os.path.getsize(output)}")


def build_variant(source: str, output: str, mobile: bool) -> None:
    mesh = import_mesh(source)
    normalize(
        mesh,
        # The source is a highly detailed sculpt with many small decorative
        # strands.  Keeping a larger fraction prevents the collapse artifacts
        # visible in the earlier 6%/10% exports while still reducing payload.
        ratio=0.2 if mobile else 0.35,
        texture_size=1024 if mobile else 2048,
        # The SPZ worlds are the subject.  A sub-one-unit avatar reads as a
        # visitor inside the scene instead of filling the camera view.
        target_height=0.84 if mobile else 0.92,
    )
    export(mesh, output, mobile)


def main() -> None:
    source, desktop, mobile = args_after_separator()
    if not os.path.exists(source):
        raise SystemExit(f"Missing source GLB: {source}")
    build_variant(source, desktop, mobile=False)
    build_variant(source, mobile, mobile=True)


if __name__ == "__main__":
    main()
