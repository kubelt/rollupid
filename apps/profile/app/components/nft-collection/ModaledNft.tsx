import { useState } from 'react'

import NftModal from './NftModal'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { Link } from '@remix-run/react'

import { HiArrowNarrowRight } from 'react-icons/hi'

import { gatewayFromIpfs } from '@kubelt/utils'

import missingNftSvg from '~/assets/missing-nft.svg'

const ModaledNft = ({ nft, isModal }: any) => {
  const [showModal, setShowModal] = useState(false)

  const [loadFail, setLoadFail] = useState(false)
  return (
    <>
      {isModal ? (
        <>
          <NftModal
            nft={nft}
            isOpen={showModal}
            handleClose={() => setShowModal(false)}
          />
          <div className="relative cursor-pointer group">
            <div
              onClick={() => {
                if (!loadFail) {
                  setShowModal(true)
                }
              }}
              className="absolute
                left-0 right-0 top-0 bottom-0
                p-1 lg:p-4 flex flex-col
                justify-end transition-all
                duration-300 rounded-lg
                invisible
                group-hover:visible
                hover:bg-black/[.4]"
            >
              <Text
                size="sm"
                weight="semibold"
                className="text-white
                invisible
                group-hover:visible
                hover:opacity-100
                "
              >
                {nft.collectionTitle}
              </Text>
              <Text
                size="sm"
                weight="semibold"
                className="text-white
                invisible
                group-hover:visible
                hover:opacity-100
               "
              >
                {nft.title}
              </Text>
            </div>

            <img
              className="w-full rounded-lg"
              src={
                loadFail
                  ? missingNftSvg
                  : gatewayFromIpfs(nft.thumbnailUrl ?? nft.url)
              }
              onError={(e) => setLoadFail(true)}
              alt="collection-item"
            />
          </div>
        </>
      ) : (
        <div
          className="rounded-lg
          truncate
          shadow 
          transition-shadow
          text-sm 
          font-semibold
          w-full
          hover:shadow-xl 
          flex
          flex-col
          align-center justify-center
         "
        >
          <Link to={`./${nft.details[0].value}`}>
            <img
              className="rounded-t-lg block
                lg:h-[13rem]
                md:h-[14rem]
                sm:h-[15rem]
                h-[20rem]
                object-contain 
                mx-auto 
              "
              src={
                loadFail
                  ? missingNftSvg
                  : gatewayFromIpfs(nft.thumbnailUrl ?? nft.url)
              }
              onError={(e) => setLoadFail(true)}
              alt="collection-representation"
            />
            <div
              className="flex text-gray-600
            flex-row whitespace-nowrap 
            w-full
            justify-between items-center px-4 py-3"
            >
              <div className="truncate leading-none">
                {nft.collectionTitle ? nft.collectionTitle : ' '}
              </div>
              <div className="text-xl">
                <HiArrowNarrowRight />
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  )
}

export default ModaledNft
