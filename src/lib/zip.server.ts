import { deflateRawSync, crc32 } from "node:zlib";

/**
 * A ZIP file, written by hand.
 *
 * Adding JSZip or archiver for this would be the sixth dependency in a
 * project that has kept its list to five, and it would be carrying a general
 * archiver to do the one thing below: pack a few dozen small text files, once
 * per purchase. Node ships both halves already — `deflateRawSync` is the
 * compression ZIP actually specifies (method 8 is a raw deflate stream, which
 * is why it is deflateRAW and not deflate), and `crc32` has been in node:zlib
 * since 22.2, which spares the usual hand-rolled lookup table.
 *
 * The format is three parts, in this order: every file as a local header
 * followed by its bytes, then a central directory repeating those headers
 * with the offset each one started at, then a twenty-two byte record saying
 * where the central directory is. Readers work backwards from that last
 * record, which is why an archive can be appended to but not truncated.
 *
 * Deliberately the SMALL version of the format: no Zip64, no data
 * descriptors, no encryption. That caps an archive at 4GB and 65,535 entries.
 * A template is twenty-odd files of source; if one ever approaches either
 * limit, something has gone wrong that a bigger zip writer would not fix.
 */

export type ZipEntry = { path: string; content: string };

const SIGNATURE = {
  local: 0x04034b50,
  central: 0x02014b50,
  end: 0x06054b50,
};

/* MS-DOS date/time, which is what ZIP stores: two-second resolution, and the
   year counted from 1980. Fixed rather than "now" so the same template
   produces a byte-identical archive on every download — a changing timestamp
   makes two copies of an identical download impossible to compare. */
const DOS_TIME = 0;
const DOS_DATE = (2024 - 1980) << 9 | (1 << 5) | 1;

export function createZip(entries: ZipEntry[]): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.path, "utf8");
    const raw = Buffer.from(entry.content, "utf8");
    const deflated = deflateRawSync(raw);

    /* Deflate can grow incompressible input. Storing it uncompressed (method
       0) is both smaller and legal, so take whichever won. */
    const compressed = deflated.length < raw.length;
    const body = compressed ? deflated : raw;
    const method = compressed ? 8 : 0;
    const checksum = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(SIGNATURE.local, 0);
    local.writeUInt16LE(20, 4); /* version needed: 2.0, for deflate */
    local.writeUInt16LE(0x0800, 6); /* flags: bit 11 — names are UTF-8 */
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28); /* no extra field */

    chunks.push(local, name, body);

    const entryHeader = Buffer.alloc(46);
    entryHeader.writeUInt32LE(SIGNATURE.central, 0);
    entryHeader.writeUInt16LE(20, 4); /* version made by */
    entryHeader.writeUInt16LE(20, 6); /* version needed */
    entryHeader.writeUInt16LE(0x0800, 8);
    entryHeader.writeUInt16LE(method, 10);
    entryHeader.writeUInt16LE(DOS_TIME, 12);
    entryHeader.writeUInt16LE(DOS_DATE, 14);
    entryHeader.writeUInt32LE(checksum, 16);
    entryHeader.writeUInt32LE(body.length, 20);
    entryHeader.writeUInt32LE(raw.length, 24);
    entryHeader.writeUInt16LE(name.length, 28);
    entryHeader.writeUInt16LE(0, 30); /* extra */
    entryHeader.writeUInt16LE(0, 32); /* comment */
    entryHeader.writeUInt16LE(0, 34); /* disk number */
    entryHeader.writeUInt16LE(0, 36); /* internal attributes */
    /* 0o644 in the high word is what unzip reads as the file mode; without it
       some tools extract source files as executable. `>>> 0` because JS
       bitwise operands are signed 32-bit and this shift overflows into a
       negative number that writeUInt32LE rejects outright. */
    entryHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    entryHeader.writeUInt32LE(offset, 42);

    central.push(entryHeader, name);
    offset += local.length + name.length + body.length;
  }

  const directory = Buffer.concat(central);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(SIGNATURE.end, 0);
  end.writeUInt16LE(0, 4); /* this disk */
  end.writeUInt16LE(0, 6); /* disk with the central directory */
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20); /* no archive comment */

  return Buffer.concat([...chunks, directory, end]);
}
