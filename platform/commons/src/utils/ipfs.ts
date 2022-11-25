export const gatewayFromIpfs = (
  ipfsUrl: string | undefined
): string | undefined => {
  const regex =
    /ipfs:\/\/(?<prefix>ipfs\/)?(?<cid>[a-zA-Z0-9]+)(?<path>(?:\/[\w.-]+)+)?/
  const match = ipfsUrl?.match(regex)

  if (!ipfsUrl || !match) return ipfsUrl

  const prefix = match[1]
  const cid = match[2]
  const path = match[3]

  const url = `https://nftstorage.link/${prefix ? `${prefix}` : 'ipfs/'}${cid}${
    path ? `${path}` : ''
  }`

  fetch(url) // prime the gateway
  return url
}
