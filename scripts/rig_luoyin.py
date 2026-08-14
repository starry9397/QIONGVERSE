"""Build web-ready rigged Luoyin avatars from the supplied static GLB.

Usage:
  blender --background --python scripts/rig_luoyin.py -- source desktop mobile

The source file is never overwritten. The generated assets contain a compact
Z-up armature and four named actions so the browser can choose the animation
state without knowing Blender internals.
"""

from __future__ import annotations

import math
import os
import sys
from typing import Iterable

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
    for datablocks in (bpy.data.armatures, bpy.data.meshes, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)


def import_source(source: str) -> bpy.types.Object:
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=source)
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("The source GLB does not contain a mesh")
    mesh = max(meshes, key=lambda item: len(item.data.vertices))
    for obj in list(bpy.context.scene.objects):
        if obj != mesh:
            bpy.data.objects.remove(obj, do_unlink=True)
    mesh.name = "SM_LuoyinAvatar"
    mesh.rotation_euler[0] = math.radians(90)
    bpy.context.view_layer.update()
    bpy.context.view_layer.objects.active = mesh
    mesh.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return mesh


def normalize_mesh(mesh: bpy.types.Object, ratio: float, texture_size: int) -> None:
    bpy.context.view_layer.objects.active = mesh
    mesh.select_set(True)
    decimate = mesh.modifiers.new(name="WEB_DECIMATE", type="DECIMATE")
    decimate.ratio = ratio
    decimate.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=decimate.name)

    corners = [mesh.matrix_world @ Vector(corner) for corner in mesh.bound_box]
    min_z = min(point.z for point in corners)
    center_x = (min(point.x for point in corners) + max(point.x for point in corners)) / 2
    center_y = (min(point.y for point in corners) + max(point.y for point in corners)) / 2
    mesh.location.x -= center_x
    mesh.location.y -= center_y
    mesh.location.z -= min_z
    bpy.context.view_layer.update()
    height = max((mesh.matrix_world @ Vector(corner)).z for corner in mesh.bound_box)
    if height > 0:
        mesh.scale = (1.65 / height,) * 3
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for image in bpy.data.images:
        if image.size[0] > texture_size or image.size[1] > texture_size:
            image.scale(texture_size, texture_size)
        image.pack()


def add_bone(armature: bpy.types.Object, name: str, head: tuple[float, float, float], tail: tuple[float, float, float], parent: str | None = None) -> None:
    bone = armature.data.edit_bones.new(name)
    bone.head = head
    bone.tail = tail
    bone.use_connect = False
    if parent:
        bone.parent = armature.data.edit_bones[parent]


def create_armature(mesh: bpy.types.Object) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    armature = bpy.context.object
    armature.name = "AM_LuoyinAvatar"
    armature.data.name = "AM_LuoyinAvatar"
    for bone in list(armature.data.edit_bones):
        armature.data.edit_bones.remove(bone)

    bounds = [mesh.matrix_world @ Vector(corner) for corner in mesh.bound_box]
    min_x = min(point.x for point in bounds)
    max_x = max(point.x for point in bounds)
    min_y = min(point.y for point in bounds)
    max_y = max(point.y for point in bounds)
    min_z = min(point.z for point in bounds)
    max_z = max(point.z for point in bounds)
    width = max(0.2, max_x - min_x)
    depth = max(0.2, max_y - min_y)
    height = max(1.0, max_z - min_z)
    cx = (min_x + max_x) / 2
    cy = (min_y + max_y) / 2

    def z(value: float) -> float:
        return min_z + height * value

    add_bone(armature, "root", (cx, cy, z(0.02)), (cx, cy, z(0.14)))
    add_bone(armature, "pelvis", (cx, cy, z(0.27)), (cx, cy, z(0.39)), "root")
    add_bone(armature, "spine", (cx, cy, z(0.39)), (cx, cy, z(0.57)), "pelvis")
    add_bone(armature, "chest", (cx, cy, z(0.57)), (cx, cy, z(0.70)), "spine")
    add_bone(armature, "neck", (cx, cy, z(0.70)), (cx, cy, z(0.81)), "chest")
    add_bone(armature, "head", (cx, cy, z(0.81)), (cx, cy, z(0.98)), "neck")

    shoulder = width * 0.30
    elbow = width * 0.48
    hand = width * 0.58
    for side, sign in (("L", -1), ("R", 1)):
        x = cx + sign * shoulder
        add_bone(armature, f"upper_arm.{side}", (x, cy, z(0.67)), (cx + sign * elbow, cy, z(0.59)), "chest")
        add_bone(armature, f"forearm.{side}", (cx + sign * elbow, cy, z(0.59)), (cx + sign * hand, cy, z(0.52)), f"upper_arm.{side}")
        add_bone(armature, f"hand.{side}", (cx + sign * hand, cy, z(0.52)), (cx + sign * (hand + width * 0.08), cy, z(0.50)), f"forearm.{side}")
        leg = width * 0.16
        knee = width * 0.18
        add_bone(armature, f"thigh.{side}", (cx + sign * leg, cy, z(0.28)), (cx + sign * knee, cy, z(0.15)), "pelvis")
        add_bone(armature, f"shin.{side}", (cx + sign * knee, cy, z(0.15)), (cx + sign * knee, cy, z(0.06)), f"thigh.{side}")
        add_bone(armature, f"foot.{side}", (cx + sign * knee, cy, z(0.06)), (cx + sign * (knee + width * 0.08), cy - depth * 0.18, z(0.035)), f"shin.{side}")

    bpy.ops.object.mode_set(mode="OBJECT")
    armature.show_in_front = True
    bpy.context.view_layer.objects.active = armature
    mesh.select_set(True)
    armature.select_set(True)
    try:
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    except RuntimeError:
        bpy.ops.object.parent_set(type="ARMATURE_ENVELOPE")
    return armature


def ensure_skin(mesh: bpy.types.Object, armature: bpy.types.Object) -> None:
    """Guarantee a valid glTF skin even when Blender heat weights fail."""
    modifier = next((item for item in mesh.modifiers if item.type == "ARMATURE"), None)
    if modifier is None:
        modifier = mesh.modifiers.new(name="AM_LuoyinAvatar", type="ARMATURE")
    modifier.object = armature
    bone_names = [bone.name for bone in armature.data.bones]
    groups = {name: mesh.vertex_groups.get(name) or mesh.vertex_groups.new(name=name) for name in bone_names}
    if len(mesh.vertex_groups) >= len(bone_names) and any(vertex.groups for vertex in mesh.data.vertices):
        return
    corners = [mesh.matrix_world @ Vector(corner) for corner in mesh.bound_box]
    min_x, max_x = min(item.x for item in corners), max(item.x for item in corners)
    min_z, max_z = min(item.z for item in corners), max(item.z for item in corners)
    width = max(0.001, max_x - min_x)
    height = max(0.001, max_z - min_z)
    for vertex in mesh.data.vertices:
        nx = (vertex.co.x - min_x) / width - 0.5
        nz = (vertex.co.z - min_z) / height
        if nz > 0.83:
            target = "head"
        elif nz < 0.18:
            target = "foot.L" if nx < 0 else "foot.R"
        elif abs(nx) > 0.28 and 0.42 < nz < 0.79:
            target = ("upper_arm.L" if nx < 0 else "upper_arm.R") if abs(nx) < 0.42 else ("forearm.L" if nx < 0 else "forearm.R")
        elif nz < 0.38:
            target = "pelvis"
        elif nz < 0.60:
            target = "spine"
        else:
            target = "chest"
        groups[target].add([vertex.index], 1.0, "REPLACE")


def action_fcurves(action: bpy.types.Action):
    """Return a legacy-compatible FCurve collection on Blender 4.4+ actions."""
    if hasattr(action, "fcurves"):
        return action.fcurves
    layer = action.layers[0] if len(action.layers) else action.layers.new("Luoyin")
    strip = layer.strips[0] if len(layer.strips) else layer.strips.new(type="KEYFRAME")
    if len(strip.channelbags):
        return strip.channelbags[0].fcurves
    slot = action.slots[0] if len(action.slots) else action.slots.new("OBJECT", "Luoyin")
    return strip.channelbags.new(slot).fcurves


def key_rotation(action: bpy.types.Action, bone: str, frame: int, axis: int, value: float) -> None:
    path = f'pose.bones["{bone}"].rotation_euler'
    fcurves = action_fcurves(action)
    curve = fcurves.find(path, index=axis) or fcurves.new(path, index=axis)
    curve.keyframe_points.insert(frame, value)


def key_location(action: bpy.types.Action, bone: str, frame: int, axis: int, value: float) -> None:
    path = f'pose.bones["{bone}"].location'
    fcurves = action_fcurves(action)
    curve = fcurves.find(path, index=axis) or fcurves.new(path, index=axis)
    curve.keyframe_points.insert(frame, value)


def create_actions(armature: bpy.types.Object) -> None:
    actions: list[bpy.types.Action] = []
    idle = bpy.data.actions.new("Luoyin_Idle")
    for frame, amount in ((1, 0.0), (24, 0.012), (48, 0.0)):
        key_location(idle, "root", frame, 2, amount)
        key_rotation(idle, "spine", frame, 1, amount * 0.5)
    actions.append(idle)

    walk = bpy.data.actions.new("Luoyin_Walk")
    for frame, amount in ((1, 0.0), (7, 0.045), (13, 0.0), (19, -0.045), (25, 0.0)):
        key_location(walk, "root", frame, 2, amount)
        key_rotation(walk, "spine", frame, 1, amount * 0.3)
    for frame, phase in ((1, 0.22), (7, -0.22), (13, 0.22), (19, -0.22), (25, 0.22)):
        key_rotation(walk, "thigh.L", frame, 1, phase)
        key_rotation(walk, "thigh.R", frame, 1, -phase)
        key_rotation(walk, "upper_arm.L", frame, 1, -phase * 0.65)
        key_rotation(walk, "upper_arm.R", frame, 1, phase * 0.65)
    actions.append(walk)

    for name, sign in (("Luoyin_TurnLeft", 1), ("Luoyin_TurnRight", -1)):
        turn = bpy.data.actions.new(name)
        key_rotation(turn, "root", 1, 2, 0.0)
        key_rotation(turn, "root", 8, 2, sign * 0.16)
        key_rotation(turn, "root", 16, 2, sign * 0.30)
        actions.append(turn)

    armature.animation_data_create()
    armature.animation_data.action = idle
    if not hasattr(idle, "fcurves") and len(idle.slots):
        armature.animation_data.action_slot = idle.slots[0]
    for action in actions:
        action.use_fake_user = True


def export_avatar(mesh: bpy.types.Object, armature: bpy.types.Object, output: str, mobile: bool) -> None:
    os.makedirs(os.path.dirname(output), exist_ok=True)
    for obj in list(bpy.context.scene.objects):
        if obj not in {mesh, armature}:
            bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.object.select_all(action="DESELECT")
    mesh.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.export_scene.gltf(
        filepath=output,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_optimize_animation_size=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6 if not mobile else 8,
        export_draco_position_quantization=14 if not mobile else 12,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12 if not mobile else 10,
        export_image_format="JPEG",
        export_jpeg_quality=88 if not mobile else 78,
    )


def build_variant(source: str, output: str, mobile: bool) -> None:
    mesh = import_source(source)
    normalize_mesh(mesh, ratio=0.12 if not mobile else 0.055, texture_size=2048 if not mobile else 1024)
    armature = create_armature(mesh)
    ensure_skin(mesh, armature)
    create_actions(armature)
    export_avatar(mesh, armature, output, mobile)
    print(f"EXPORT_OK {output} bytes={os.path.getsize(output)}")


def main() -> None:
    source, desktop, mobile = args_after_separator()
    if not os.path.exists(source):
        raise SystemExit(f"Missing source GLB: {source}")
    build_variant(source, desktop, mobile=False)
    build_variant(source, mobile, mobile=True)


if __name__ == "__main__":
    main()
