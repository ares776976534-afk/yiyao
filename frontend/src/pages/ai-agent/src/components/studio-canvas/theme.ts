const bodyStyle = getComputedStyle(
  document.querySelector("[data-root=studio]") || document.body
);

export default {
  var(name: string) {
    return bodyStyle.getPropertyValue(name);
  },
};

export const Images = {
  watermark: "https://img.alicdn.com/imgextra/i4/O1CN01hzq0Rw1rOvnOAl09x_!!6000000005622-55-tps-34-25.svg",
  videoPlayIcon:
    "https://img.alicdn.com/imgextra/i1/O1CN010xkhoI29zifKdjKon_!!6000000008139-55-tps-60-60.svg",
};
