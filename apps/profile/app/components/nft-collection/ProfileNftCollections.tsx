import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { mergeSortedNfts } from '~/helpers/nfts'

import Masonry from 'react-masonry-css'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

import LoadingGrid from './NftGrid'
import ShowPartners from './ShowPartners'
import ModaledNft from './ModaledNft'
import CollectionFilter from './CollectionFilter'

export type ProfileNftCollectionsProps = {
  account: string
  displayname?: string
  nfts?: {
    url: string
    title: string
    collectionTitle: string
  }[]
  pfp: string
  isOwner?: boolean
  preload?: boolean
  detailsModal?: boolean
  filters?: boolean

  handleSelectedNft?: (nft: any) => void

  nftRenderer?: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
  nftGrid: JSX.Element
}

const ProfileNftCollections = ({
  nfts = [],
  isOwner = true,
  account,
  displayname,
  preload = false,
  filters = false,
  handleSelectedNft,
  pfp,
  nftRenderer = (nft) => (
    <ModaledNft nft={nft} isModal={false} account={account} />
  ),
  nftGrid = <LoadingGrid />,
}: ProfileNftCollectionsProps) => {
  const [refresh, setRefresh] = useState(true)

  const [loadedNfts, setLoadedNfts] = useState(nfts)

  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const [openedFilters, setOpenedFilters] = useState(false)

  const [textFilter, setTextFilter] = useState('')
  const [curFilter, setCurFilter] = useState('All Collections')

  const [colFilters, setColFilters] = useState([
    { title: 'All Collections', img: undefined },
    { title: 'Untitled Collections', img: undefined },
  ])

  const [selectedNft, setSelectedNft] = useState('')

  const getMoreNfts = async () => {
    const request = `/nfts?owner=${account}${
      pageKey ? `&pageKey=${pageKey}` : ''
    }`

    const nftReq: any = await fetch(request)
    const nftRes: any = await nftReq.json()

    /* We already have only 1 NFT per collection
     ** No need to put it in additional Set data structure
     */
    setColFilters([
      ...colFilters,
      ...nftRes.ownedNfts.reduce((acc: any, nft: any) => {
        if (
          nft.collectionTitle &&
          nft.collectionTitle !== 'All Collections' &&
          nft.collectionTitle !== 'Untitled Collections'
        ) {
          return [
            ...acc,
            {
              title: nft.collectionTitle,
              img: nft.thumbnailUrl ? nft.thumbnailUrl : undefined,
            },
          ]
        } else {
          return acc
        }
      }, []),
    ])

    setLoadedNfts(mergeSortedNfts(loadedNfts, nftRes.ownedNfts))
    setPageLink(nftRes.pageKey ?? null)

    if (refresh) {
      setRefresh(false)
    }
  }

  useEffect(() => {
    if (pageKey) {
      setLoading(true)
      getMoreNfts()
    } else if (pageKey === null) {
      setLoading(false)
    }
  }, [pageKey])

  useMemo(() => {
    setRefresh(true)

    setLoadedNfts([])
    setPageLink(undefined)
  }, [account])

  useEffect(() => {
    const asyncFn = async () => {
      await getMoreNfts()
    }

    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  const filteredLoadedNfts = loadedNfts.filter(
    (nft) =>
      curFilter === 'All Collections' ||
      curFilter === nft.collectionTitle ||
      (!nft.collectionTitle && curFilter === 'Untitled Collections')
  )

  return (
    <>
      {!loading && !refresh && !isOwner && !loadedNfts.length && (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          Looks like {displayname ?? account} doesn't own any NFTs
        </Text>
      )}
      {!loading && !refresh && isOwner && !loadedNfts.length && (
        <ShowPartners />
      )}

      {/* If we browse all collections of a user */}
      {filters && loadedNfts.length > 0 && (
        <>
          <CollectionFilter
            colFilters={colFilters}
            setCurFilter={setCurFilter}
            curFilter={curFilter}
            openedFilters={openedFilters}
            setOpenedFilters={setOpenedFilters}
            setTextFilter={setTextFilter}
            textFilter={textFilter}
            pfp={pfp}
          />

          <InfiniteScroll
            dataLength={loadedNfts.length} //This is important field to render the next data
            next={preload ? () => {} : getMoreNfts}
            hasMore={preload ? false : pageKey != null}
            loader={<Spinner />}
          >
            <Masonry
              breakpointCols={{
                default: 5,
                1280: 4,
                1024: 3,
                768: 2,
                640: 1,
              }}
              className="flex w-auto"
              columnClassName="bg-clip-padding"
            >
              {filteredLoadedNfts.map((nft, index) => {
                return (
                  <div
                    key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`}
                    className="flex
                      justify-center
                      pl-[10%]
                      w-[90%]
                      mb-10
                      "
                  >
                    {nftRenderer(
                      nft,
                      selectedNft ===
                        `${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`,
                      (selectedNft: any) => {
                        setSelectedNft(
                          `${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`
                        )

                        if (handleSelectedNft) {
                          handleSelectedNft(selectedNft)
                        }
                      }
                    )}
                  </div>
                )
              })}
            </Masonry>
          </InfiniteScroll>
        </>
      )}

      {(refresh || loading) && nftGrid}
    </>
  )
}

export default ProfileNftCollections
