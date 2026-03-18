import Image from "next/image"

export function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24">
      <Image
        src="/404_image.gif"
        alt="В разработке"
        width={320}
        height={320}
        unoptimized
        className="rounded-[10px]"
      />
      <p className="text-[26px] font-semibold">Страница в разработке</p>
      <p className="text-muted-foreground text-xl">Скоро всё будет готово</p>
    </div>
  )
}
