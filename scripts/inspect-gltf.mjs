import * as THREE from 'three';
import fs from 'node:fs';

// Manual GLB parse — only the geometry bbox after applying the node
// matrices (GLTFLoader would need a DOM for textures).
const buf = fs.readFileSync('public/models/iphone_14_pro.glb');
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
const binChunkStart = 20 + jsonLen + 8;
const binData = buf.subarray(binChunkStart);

const posAccessorIdx = json.meshes[0].primitives[0].attributes.POSITION;
const acc = json.accessors[posAccessorIdx];
const bv = json.bufferViews[acc.bufferView];
const offset = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
const count = acc.count;
const positions = new Float32Array(binData.buffer, binData.byteOffset + offset, count * 3);

function matFromArray(a) {
  const m = new THREE.Matrix4();
  m.fromArray(a);
  return m;
}
const mSketchfab = matFromArray(json.nodes[0].matrix);
const mCollada = matFromArray(json.nodes[1].matrix);
const mIphone = matFromArray(json.nodes[2].matrix);
const world = new THREE.Matrix4().multiplyMatrices(mSketchfab, mCollada).multiply(mIphone);

const v = new THREE.Vector3();
const box = new THREE.Box3();
for (let i = 0; i < count; i++) {
  v.fromArray(positions, i * 3).applyMatrix4(world);
  box.expandByPoint(v);
}
const size = new THREE.Vector3();
const centre = new THREE.Vector3();
box.getSize(size);
box.getCenter(centre);
console.log('world bbox after composed matrices:');
console.log(
  '  min   :',
  box.min.toArray().map((n) => n.toFixed(5)),
);
console.log(
  '  max   :',
  box.max.toArray().map((n) => n.toFixed(5)),
);
console.log(
  '  size  :',
  size.toArray().map((n) => n.toFixed(5)),
);
console.log(
  '  centre:',
  centre.toArray().map((n) => n.toFixed(5)),
);
const longest = Math.max(...size.toArray());
console.log(
  '  ratio (x:y:z normalised to longest):',
  size.toArray().map((n) => (n / longest).toFixed(3)),
);
console.log();
console.log('iPhone 14 Pro real ratio (W:H:D = 71.5:147.5:7.85):');
console.log('  -> normalised: 0.485 : 1.000 : 0.053');
