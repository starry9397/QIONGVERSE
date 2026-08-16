"""Create a smaller web delivery GLB without overwriting the source asset.

The source files contain embedded 4096px PNG textures. This utility rewrites
only embedded images at a bounded size, preserves the remaining glTF buffer
views, and leaves geometry compression to glTF Transform's Draco command.
"""

from __future__ import annotations

import argparse
import io
import json
import struct
from pathlib import Path

from PIL import Image


def align4(value: int) -> int:
    return (value + 3) & ~3


def parse_glb(raw: bytes) -> tuple[dict, bytes]:
    if raw[:4] != b"glTF":
        raise ValueError("not a GLB file")
    offset = 12
    document = None
    binary = None
    while offset + 8 <= len(raw):
        length, chunk_type = struct.unpack_from("<I4s", raw, offset)
        payload = raw[offset + 8 : offset + 8 + length]
        if chunk_type == b"JSON":
            document = json.loads(payload.decode("utf-8").rstrip(" \t\r\n\x00"))
        elif chunk_type == b"BIN\x00":
            binary = payload
        offset += 8 + length
    if document is None or binary is None:
        raise ValueError("GLB is missing JSON or BIN chunk")
    return document, binary


def encode_glb(document: dict, binary: bytes) -> bytes:
    json_payload = json.dumps(document, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_payload += b" " * ((4 - len(json_payload) % 4) % 4)
    binary += b"\x00" * ((4 - len(binary) % 4) % 4)
    total_length = 12 + 8 + len(json_payload) + 8 + len(binary)
    return b"glTF" + struct.pack("<II", 2, total_length) + struct.pack("<I4s", len(json_payload), b"JSON") + json_payload + struct.pack("<I4s", len(binary), b"BIN\x00") + binary


def image_bytes(source: bytes, name: str, limit: int) -> tuple[bytes, str]:
    with Image.open(io.BytesIO(source)) as image:
        image.load()
        if max(image.size) > limit:
            scale = limit / max(image.size)
            size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
            image = image.resize(size, Image.Resampling.LANCZOS)
        mode = "RGBA" if "A" in image.getbands() else "RGB"
        image = image.convert(mode)
        out = io.BytesIO()
        image.save(out, format="PNG", optimize=True)
        return out.getvalue(), "image/png"


def optimize(source: Path, target: Path, limit: int) -> None:
    document, binary = parse_glb(source.read_bytes())
    views = document.get("bufferViews", [])
    images = document.get("images", [])
    image_view_ids = {image.get("bufferView") for image in images if image.get("bufferView") is not None}
    image_by_view = {image.get("bufferView"): image for image in images if image.get("bufferView") is not None}

    rebuilt = bytearray()
    remapped: dict[tuple[int, int], tuple[int, int]] = {}
    for index, view in enumerate(views):
        old_offset = view.get("byteOffset", 0)
        old_length = view["byteLength"]
        key = (old_offset, old_length)
        if key in remapped:
            new_offset, new_length = remapped[key]
        else:
            payload = binary[old_offset : old_offset + old_length]
            image = image_by_view.get(index)
            if image is not None:
                payload, mime = image_bytes(payload, image.get("name", ""), limit)
                image["mimeType"] = mime
                image.pop("uri", None)
            new_offset = align4(len(rebuilt))
            rebuilt.extend(b"\x00" * (new_offset - len(rebuilt)))
            rebuilt.extend(payload)
            new_length = len(payload)
            remapped[key] = (new_offset, new_length)
        view["byteOffset"] = new_offset
        view["byteLength"] = new_length

    document.setdefault("buffers", [{}])[0]["byteLength"] = len(rebuilt)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(encode_glb(document, bytes(rebuilt)))
    print(f"TEXTURE_OPTIMIZED {source} -> {target} bytes={target.stat().st_size} imageViews={len(image_view_ids)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    parser.add_argument("--max-texture", type=int, default=2048)
    args = parser.parse_args()
    optimize(args.source, args.target, args.max_texture)


if __name__ == "__main__":
    main()
