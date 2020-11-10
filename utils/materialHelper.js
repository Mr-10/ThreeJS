export const setMaterial = (parent, material, activeOption) => {
  parent.traverse((o) => {
    const materialMap = {
      sofa: ["sofa", "cushions"],
      pillows: ["pillows"],
    };
    if (o.isMesh && materialMap[activeOption].includes(o.name)) {
      o.material = material;
    }
  });
};

export const getTextureMaterial = (color) => {
  let texture = new THREE.TextureLoader().load(color.texture);
  texture.repeat.set(color.size[0], color.size[1], color.size[2]);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const material = new THREE.MeshPhongMaterial({
    map: texture,
    shininess: color.shininess ? color.shininess : 10,
  });
  return material;
};
