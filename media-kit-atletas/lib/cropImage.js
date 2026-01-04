export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    // Apenas para imagens externas (não locais)
    if (url.startsWith('http')) {
        image.setAttribute('crossOrigin', 'anonymous')
    }
    image.src = url
  })

export default async function getCroppedImg(imageSrc, pixelCrop) {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    // PROTEÇÃO: Se o pixelCrop vier zerado (erro comum), usa o tamanho original da imagem
    const width = pixelCrop.width > 0 ? pixelCrop.width : image.width;
    const height = pixelCrop.height > 0 ? pixelCrop.height : image.height;
    const x = pixelCrop.width > 0 ? pixelCrop.x : 0;
    const y = pixelCrop.width > 0 ? pixelCrop.y : 0;

    canvas.width = width
    canvas.height = height

    // Desenha
    ctx.drawImage(
      image,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          // Se mesmo assim falhar, rejeita com erro claro
          console.error("Canvas toBlob falhou. Dimensões:", width, height);
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  } catch (e) {
    console.error('Erro fatal no recorte:', e)
    return null
  }
}