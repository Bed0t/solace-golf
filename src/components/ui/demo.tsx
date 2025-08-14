import { InfiniteSlider } from "@/components/ui/infinite-slider";

function InfiniteSliderBasic() {
  return (
    <InfiniteSlider gap={12} reverse className="w-full h-full blur-sm bg-white">
      <img
        src="/swatches/Swatch Group.png"
        alt="Swatch Group"
        className="h-[120px] w-auto"
      />
      <img
        src="/swatches/Swatch Group.png"
        alt="Swatch Group"
        className="h-[120px] w-auto"
      />
      <img
        src="/swatches/Swatch Group.png"
        alt="Swatch Group"
        className="h-[120px] w-auto"
      />
      <img
        src="/swatches/Swatch Group.png"
        alt="Swatch Group"
        className="h-[120px] w-auto"
      />            x
    </InfiniteSlider>
  );
}

export default {
  InfiniteSliderBasic,
};


