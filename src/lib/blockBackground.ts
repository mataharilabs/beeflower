import type { CSSProperties } from "react";

export function getBlockBgStyle(props: any): CSSProperties {
  if (props?.bgType === "image" && props?.bgImage) {
    const fit: string = props?.bgImageFit ?? "cover";
    const style: CSSProperties = {
      backgroundImage: `url(${props.bgImage})`,
      backgroundSize: fit === "original" ? "auto" : fit,
      backgroundPosition: props?.bgImagePosition ?? "center",
    };
    if (fit === "original") style.backgroundRepeat = "no-repeat";
    return style;
  }
  if (props?.bgType === "color" && props?.bgColor) {
    return { backgroundColor: props.bgColor };
  }
  // backward compat: Hero had bgImage without bgType
  if (!props?.bgType && props?.bgImage) {
    return {
      backgroundImage: `url(${props.bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  // backward compat: CTABanner had bgColor without bgType
  if (!props?.bgType && props?.bgColor) {
    return { backgroundColor: props.bgColor };
  }
  return {};
}

export function shouldShowOverlay(props: any): boolean {
  if (props?.bgType !== undefined) return !!props?.overlayEnabled;
  return !!(props?.overlay && props?.bgImage);
}

export function getOverlayStyle(props: any): CSSProperties {
  if (props?.bgType !== undefined) {
    return {
      backgroundColor: props?.overlayColor ?? "#000000",
      opacity: (props?.overlayOpacity ?? 40) / 100,
    };
  }
  return { backgroundColor: "#000000", opacity: 0.4 };
}
