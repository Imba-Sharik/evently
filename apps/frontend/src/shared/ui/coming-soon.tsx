import Image from "next/image"

export function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Image
        src="/404_image.gif"
        alt="В разработке"
        width={320}
        height={320}
        unoptimized
      />
      <p className="text-2xl font-semibold">Страница в разработке</p>
      <p className="text-muted-foreground text-lg">Скоро всё будет готово</p>
    </div>
  )
}
