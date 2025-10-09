// 全屏事件检测
const getOnfullscreEnevt = () => {
  if (document.documentElement.requestFullScreen) {
    return 'onfullscreenchange'
  } else if (document.documentElement.webkitRequestFullScreen) {
    return 'onwebkitfullscreenchange'
  } else if (document.documentElement.mozRequestFullScreen) {
    return 'onmozfullscreenchange'
  } else if (document.documentElement.msRequestFullscreen) {
    return 'onmsfullscreenchange'
  }
}

export const fullscrrenEvent = getOnfullscreEnevt()

// 全屏
export const fullScreen = element => {
  if (element.requestFullScreen) {
    element.requestFullScreen()
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  }
}

// 文件转buffer
export const fileToBuffer = file => {
  return new Promise(r => {
    const reader = new FileReader()
    reader.onload = () => {
      r(reader.result)
    }
    reader.readAsArrayBuffer(file)
  })
}

// 复制文本到剪贴板
export const copy = text => {
  // 使用textarea可以保留换行
  const input = document.createElement('textarea')
  // input.setAttribute('value', text)
  input.innerHTML = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

// 复制文本到剪贴板
export const setDataToClipboard = data => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(data)
  }
}

// 复制图片到剪贴板
export const setImgToClipboard = img => {
  if (navigator.clipboard && navigator.clipboard.write) {
    const data = [new ClipboardItem({ ['image/png']: img })]
    navigator.clipboard.write(data)
  }
}

// 打印大纲
export const printOutline = el => {
  const printContent = el.outerHTML
  const iframe = document.createElement('iframe')
  iframe.setAttribute('style', 'position: absolute; width: 0; height: 0;')
  document.body.appendChild(iframe)
  const iframeDoc = iframe.contentWindow.document
  // 将当前页面的所有样式添加到iframe中
  const styleList = document.querySelectorAll('style')
  Array.from(styleList).forEach(el => {
    iframeDoc.write(el.outerHTML)
  })
  // 设置打印展示方式 - 纵向展示
  iframeDoc.write('<style media="print">@page {size: portrait;}</style>')
  // 写入内容
  iframeDoc.write('<div>' + printContent + '</div>')
  setTimeout(function() {
    iframe.contentWindow?.print()
    document.body.removeChild(iframe)
  }, 500)
}

export const getParentWithClass = (el, className) => {
  if (el.classList && el.classList.contains(className)) {
    return el
  }
  if (el.parentNode && el.parentNode !== document.body) {
    return getParentWithClass(el.parentNode, className)
  }
  return null
}

// 压缩图片
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const fileType = file.type
    let {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      mimeType = '',
      exportType = 'dataURL' // blob、file
    } = options
    const reader = new FileReader()
    reader.onload = event => {
      // 不处理gif格式
      if (/\/gif$/.test(fileType)) {
        return resolve(event.target.result)
      }
      mimeType = mimeType || fileType
      const img = new Image()
      img.onload = () => {
        // 计算新尺寸，保持宽高比
        let width = img.width
        let height = img.height
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        if (exportType === 'blob') {
          canvas.toBlob(
            blob => {
              resolve(blob)
            },
            mimeType,
            quality
          )
        } else if (exportType === 'file') {
          canvas.toBlob(
            blob => {
              const newFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now()
              })
              resolve(newFile)
            },
            mimeType,
            quality
          )
        } else {
          resolve(canvas.toDataURL(mimeType, quality))
        }
      }
      img.onerror = function() {
        reject(new Error('图片加载失败'))
      }
      img.src = event.target.result
    }
    reader.onerror = function() {
      reject(new Error('文件读取失败'))
    }
    reader.readAsDataURL(file)
  })
}

export const isHyperlink = text => {
  return /^https?:\/\//.test(text)
}

export const isNormalUrl = url => {
  return isHyperlink(url) || /^data:/.test(url)
}

export const isObLinkText = lt => {
  return /(!?)\[\[([^\]\|\#]*?)(?:(#|\^)([^\]\|]*))?(?:\|([^\]]*))?\]\]/g.test(
    lt
  )
}

export const dfsTraverse = (root, callback = () => {}) => {
  if (!root) return
  const stack = [root] // 使用栈存储待处理节点
  while (stack.length > 0) {
    const currentNode = stack.pop() // 取栈顶节点
    callback(currentNode) // 处理当前节点
    // 将子节点逆序压入栈（保证从左到右遍历）
    if (currentNode.children) {
      for (let i = currentNode.children.length - 1; i >= 0; i--) {
        stack.push(currentNode.children[i])
      }
    }
  }
}

// MIME 类型到扩展名的映射表
const mimeToExtension = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff'
}
// 根据 Blob 类型生成正确扩展名的文件名
export const getFilenameWithExtension = (filename, type) => {
  // 提取主文件名（不含原扩展名）
  const dotIndex = filename.lastIndexOf('.')
  const baseName = dotIndex > 0 ? filename.substring(0, dotIndex) : filename
  // 获取对应的扩展名（未知类型时返回 undefined）
  const extension = mimeToExtension[type]
  // 返回带正确扩展名的新文件名
  return extension ? `${baseName}${extension}` : filename
}

export const base64ToFile = (base64Data, filename, mimeType) => {
  if (!mimeType) {
    const matchRes = base64Data.match(/^data:([^;]+);/)
    mimeType = matchRes && matchRes[1] ? matchRes[1] : 'image/png'
  }
  filename = getFilenameWithExtension(filename || 'file' + Date.now(), mimeType)
  // 1. 分离 Base64 数据头（如果存在）
  const base64WithoutHeader = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data
  // 2. 解码 Base64 字符串为二进制数据
  const byteCharacters = atob(base64WithoutHeader)
  // 3. 转换为 Uint8Array
  const byteArrays = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays[i] = byteCharacters.charCodeAt(i)
  }
  // 4. 创建 Blob 对象
  const blob = new Blob([byteArrays], { type: mimeType })
  // 5. 转换为 File 对象
  return new File([blob], filename, {
    type: mimeType,
    lastModified: Date.now()
  })
}

export const imageUrlToBase64 = async url => {
  try {
    // 1. 获取图片资源
    const response = await fetch(url)
    // 2. 检查响应状态
    if (!response.ok) {
      throw new Error('请求失败')
    }
    // 3. 获取图片Blob
    const blob = await response.blob()
    // 4. 转换为Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // 获取完整的Base64字符串（包含data:前缀）
        resolve(reader.result)
      }
      reader.onerror = reject
      // 开始读取Blob数据
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('转换失败:', error)
    throw error
  }
}

export const checkMindTreeHasImg = tree => {
  let hasImg = false
  const walk = root => {
    if (root.data.image) {
      hasImg = true
      return
    }
    if (root.children) {
      for (let i = 0; i < root.children.length; i++) {
        walk(root.children[i])
      }
    }
  }
  walk(tree)
  return hasImg
}