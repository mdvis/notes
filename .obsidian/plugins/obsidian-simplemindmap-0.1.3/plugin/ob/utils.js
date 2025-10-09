import manifestJson from '../../manifest.json'

//  极简的深拷贝
export const simpleDeepClone = data => {
  try {
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return null
  }
}

export const generateRandomString = (
  length = 12,
  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
) => {
  // 参数验证
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('长度必须是正整数')
  }
  if (typeof charSet !== 'string' || charSet.length === 0) {
    throw new Error('字符集不能为空')
  }

  // 使用加密安全的随机数生成器（如果可用）
  let randomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)
  } else {
    randomValues = new Array(length)
      .fill(0)
      .map(() => Math.random() * 0x100000000)
  }

  // 生成随机字符串
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charSet.length
    result += charSet.charAt(randomIndex)
  }

  return result
}

export const hideTargetMenu = (menu, text = '在新窗口中打开') => {
  // 隐藏特定默认菜单项
  menu.items.forEach(item => {
    // 通过菜单项标题或ID识别要隐藏的项
    if (item.title === text || item.dom?.innerText?.includes(text)) {
      item.dom.hide()
    }
  })
}

export const dataURItoBlob = dataURI => {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

export const getUidFromSource = data => {
  const { matches, content } = data.match
  const total = content.length
  const last = matches[matches.length - 1]
  let index = last[1]
  let str = content[index]
  // 当检测到^时，记录后面的字符
  // 当检测到换行符时，跳出循环
  let uid = ''
  let isJoin = false
  while (true || index >= total) {
    if (isJoin && (str === '\n' || str === undefined)) {
      break
    }
    if (isJoin) {
      uid += str
    }
    if (str === '^') {
      isJoin = true
    }
    index++
    str = content[index]
  }
  return uid
}

export let versionUpdateCheckTimer = null
let versionUpdateChecked = false
export const checkVersion = async (
  callback = () => {},
  force = false,
  err = () => {}
) => {
  if (!force && versionUpdateChecked) {
    return
  }
  versionUpdateChecked = true
  try {
    const gitAPIrequest = async () => {
      return JSON.parse(
        await request({
          url: `https://api.github.com/repos/wanglin2/obsidian-simplemindmap/releases?per_page=15&page=1`
        })
      )
    }
    const latestVersion = (await gitAPIrequest())
      .filter(el => !el.draft && !el.prerelease)
      .map(el => {
        return {
          version: el.tag_name,
          published: new Date(el.published_at)
        }
      })
      .filter(el => el.version.match(/^\d+\.\d+\.\d+$/))
      .sort((el1, el2) => el2.published - el1.published)[0].version
    if (isVersionNewerThanOther(latestVersion, manifestJson.version)) {
      callback(latestVersion)
    } else {
      callback()
    }
  } catch (e) {
    console.error('检查更新失败', e)
    err(e)
  }
  versionUpdateCheckTimer = window.setTimeout(() => {
    versionUpdateChecked = false
    versionUpdateCheckTimer = null
  }, 28800000 * 3) // 24小时检查一次
}

export const isVersionNewerThanOther = (version, otherVersion) => {
  if (!version || !otherVersion) return true
  const v = version.match(/(\d*)\.(\d*)\.(\d*)/)
  const o = otherVersion.match(/(\d*)\.(\d*)\.(\d*)/)
  return Boolean(
    v &&
      v.length === 4 &&
      o &&
      o.length === 4 &&
      !(
        isNaN(parseInt(v[1])) ||
        isNaN(parseInt(v[2])) ||
        isNaN(parseInt(v[3]))
      ) &&
      !(
        isNaN(parseInt(o[1])) ||
        isNaN(parseInt(o[2])) ||
        isNaN(parseInt(o[3]))
      ) &&
      (parseInt(v[1]) > parseInt(o[1]) ||
        (parseInt(v[1]) >= parseInt(o[1]) && parseInt(v[2]) > parseInt(o[2])) ||
        (parseInt(v[1]) >= parseInt(o[1]) &&
          parseInt(v[2]) >= parseInt(o[2]) &&
          parseInt(v[3]) > parseInt(o[3])))
  )
}
